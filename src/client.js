import EthUtils from 'ethereumjs-util';
import EthereumTx from 'ethereumjs-tx';
import Storage from '@/storage';
import assert from 'assert';

class Client {
  constructor (clientConfig, ifc) {
    this.clientConfig = clientConfig;
    this.ifc = ifc;
    this._rawPaymentStoragePrefix = 'raw:';
    this._storage = new Storage(clientConfig.db);
  }

  makeRawPayment = (value, data) => {
    assert(data.pkUser, 'Parameter \'data\' does not include key \'pkUser\'');
    assert(data.pkStakeholder, 'Parameter \'data\' does not include key \'pkStakeholder\'');

    let sidechain = this.ifc.sidechain;
    let latestStageHeight = sidechain.getLatestStageHeight();
    let newStageHeight = parseInt(latestStageHeight) + 1;

    return {
      from: this.clientConfig.clientAddress,
      to: this.clientConfig.serverAddress,
      value: value,
      localSequenceNumber: 0,
      stageHeight: newStageHeight,
      data: data
    };
  }

  audit = async (paymentHash) => {
    try {
      let sidechain = this.ifc.sidechain;

      // Get payment from storage
      let payment = await this.getPayment(paymentHash);

      // 1. Get slice and compute root hash
      let body = await sidechain.getSlice(payment.stageHeight, paymentHash);
      let slice = body.data.slice;
      let paymentHashArray = body.data.paymentHashArray;
      var localStageRootHash = '';
      if (paymentHashArray.includes(paymentHash)) {

        localStageRootHash = '0x' + this._computeRootHashFromSlice(slice);
        // 2. Get root hash from blockchain
        let stageHash = '0x' + payment.stageHash;
        let stageRootHash = await sidechain.getStageRootHash(stageHash);

        // 3. Compare
        return (localStageRootHash == stageRootHash);
      } else {
        return false;
      }
    } catch (e) {
      console.error(e);
    }
  }

  takeObjection = async (payment) => {
    let _web3 = this.ifc.sidechain._web3;
    let stageHash = '0x' + payment.stageHash;
    let paymentHash = '0x' + payment.paymentHash;
    let ifcObj = this.ifc.sidechain.getIFCContract();
    let keyInfo = this.ifc.crypto.keyInfo();
    let eccPrivateKey = keyInfo.eccPrivateKey;
    let eccAddress = keyInfo.address;

    let txMethodData = ifcObj.takeObjection.getData(
      [stageHash, paymentHash],
      payment.v,
      payment.r,
      payment.s,
      { from: eccAddress }
    );

    let newNonce = _web3.toHex(_web3.eth.getTransactionCount(eccAddress));

    let txParams = {
      nonce: newNonce,
      gas: 4700000,
      from: eccAddress,
      to: ifcObj.address,
      data: txMethodData
    };

    let tx = new EthereumTx(txParams);
    eccPrivateKey = eccPrivateKey.substring(2);
    tx.sign(Buffer.from(eccPrivateKey, 'hex'));
    let serializedTx = '0x' + tx.serialize().toString('hex');
    let txHash = await _web3.eth.sendRawTransaction(serializedTx);

    return txHash;
  }

  verifyPayment = async (payment) => {
    let crypto = this.ifc.crypto;

    // 1. Verify ciphers
    let cipherUser = payment.cipherUser;
    let cipherCP = payment.cipherCP;
    try {
      crypto.decrypt(cipherUser);
    } catch (e) {
      return false;
    }

    // 2. Verify paymentHash
    if (!(payment.paymentHash == EthUtils.sha3(cipherUser + cipherCP).toString('hex'))) {
      return false;
    }

    // 3. Check if the paymentHash is in client storage
    let result = await this.getRawPayment(payment.paymentHash);
    if (result == null) {
      return false;
    }

    return true;
  }

  getRawPayment = async (paymentHash) => {
    try {
      let key = this._rawPaymentStoragePrefix + paymentHash;
      let result = await this._storage.get(key);
      return JSON.parse(result);
    } catch (e) {
      console.log(e);
    }
  }

  getPayment = async (paymentHash) => {
    try {
      let result = await this._storage.get(paymentHash);
      return JSON.parse(result);
    } catch (e) {
      console.log(e);
    }
  }

  // getAllPayments = async () => {
  //   try {
  //     let results = await this._storage.getAll();
  //     return results.map((result) => {
  //       try {
  //         return JSON.parse(result);
  //       } catch (e) {
  //         console.log(e);
  //         return false;
  //       }
  //     }).filter((result) => {
  //       return !!result;
  //     });
  //   } catch (e) {
  //     console.log(e);
  //   }
  // }

  saveRawPayment = async (rawPayment) => {
    let key = this._rawPaymentStoragePrefix + this._makeUnsignedPayment(rawPayment).paymentHash;
    await this._storage.set(key, JSON.stringify(rawPayment));
  }

  savePayment = async (payment) => {
    assert(payment.hasOwnProperty('paymentHash'), 'Payment should have key \'paymentHash\'');
    await this._storage.set(payment.paymentHash, JSON.stringify(payment));
  }

  export = () => {
  }

  _sha3 (content) {
    return EthUtils.sha3(content).toString('hex');
  }

  _computeRootHashFromSlice (slice) {
    let firstNode = slice.shift();

    let rootNode = slice.reduce((acc, curr) => {
      if (acc.treeNodeIndex % 2 == 0) {
        acc.treeNodeHash = this._sha3(acc.treeNodeHash.concat(curr.treeNodeHash));
      } else {
        acc.treeNodeHash = this._sha3(curr.treeNodeHash.concat(acc.treeNodeHash));
      }
      acc.treeNodeIndex = parseInt(acc.treeNodeIndex / 2);
      return acc;
    }, firstNode);

    return rootNode.treeNodeHash;
  }

  _makeUnsignedPayment = (rawPayment) => {
    assert(this._validateRawPayment(rawPayment), 'Wrong rawPayment format.');

    let stageHash = EthUtils.sha3(rawPayment.stageHeight.toString()).toString('hex');

    let paymentHashAndCiphers = this._computePaymentHashAndCiphers(rawPayment);
    let paymentHash = paymentHashAndCiphers.paymentHash;
    let ciphers = paymentHashAndCiphers.ciphers;

    return {
      stageHeight: rawPayment.stageHeight,
      stageHash: stageHash.toString('hex'),
      paymentHash: paymentHash.toString('hex'),
      cipherUser: ciphers.cipherUser,
      cipherCP: ciphers.cipherCP
    };
  }

  _validateRawPayment = (rawPayment) => {
    if (!rawPayment.hasOwnProperty('from') ||
        !rawPayment.hasOwnProperty('to') ||
        !rawPayment.hasOwnProperty('value') ||
        !rawPayment.hasOwnProperty('localSequenceNumber') ||
        !rawPayment.hasOwnProperty('stageHeight') ||
        !rawPayment.hasOwnProperty('data')) {
      return false;
    }

    let data = rawPayment.data;

    if (!data.hasOwnProperty('pkUser') ||
        !data.hasOwnProperty('pkStakeholder')) {
      return false;
    }

    return true;
  }

  _computePaymentHashAndCiphers = (rawPayment) => {
    let crypto = this.ifc.crypto;
    let serializedRawPayment = Buffer.from(JSON.stringify(rawPayment)).toString('hex');
    let cipherUser = crypto.encrypt(serializedRawPayment, rawPayment.data.pkUser);
    let cipherCP = crypto.encrypt(serializedRawPayment, rawPayment.data.pkStakeholder);
    let paymentHash = EthUtils.sha3(cipherUser + cipherCP).toString('hex');

    return {
      paymentHash: paymentHash,
      ciphers: {
        cipherUser: cipherUser,
        cipherCP: cipherCP,
      }
    };
  }

  _computeTreeNodeHash = (paymentHashArray) => {
    let hash = paymentHashArray.reduce((acc, curr) => {
      return acc.concat(curr);
    });

    return this._sha3(hash);
  }
}

export default Client;
