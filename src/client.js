import EthUtils from 'ethereumjs-util';
import assert from 'assert';

class Client {
  constructor (clientConfig, ifc) {
    this.clientAddress = clientConfig.clientAddress;
    this.serverAddress = clientConfig.serverAddress;
    this.ifc = ifc;
    this._storage = clientConfig.storage;
    this._nodeUrl = clientConfig.nodeUrl;
  }

  makeRawPayment = (value, lsn, data) => {
    assert(data.pkClient, 'Parameter \'data\' does not include key \'pkClient\'');
    assert(data.pkStakeholder, 'Parameter \'data\' does not include key \'pkStakeholder\'');

    let sidechain = this.ifc.sidechain;
    let latestStageHeight = sidechain.getLatestStageHeight();
    let newStageHeight = parseInt(latestStageHeight) + 1;

    return {
      from: this.clientAddress,
      to: this.serverAddress,
      value: value,
      localSequenceNumber: lsn,
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
    return this.ifc.sidechain.takeObjection(payment);
  }

  verifyPayment = async (payment) => {
    let crypto = this.ifc.crypto;

    // 1. Verify ciphers
    let cipherClient = payment.cipherClient;
    let cipherStakeholder = payment.cipherStakeholder;
    try {
      crypto.decrypt(cipherClient);
    } catch (e) {
      return false;
    }

    // 2. Verify paymentHash
    if (!(payment.paymentHash == EthUtils.sha3(cipherClient + cipherStakeholder).toString('hex'))) {
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
      return await this._storage.getRawPayment(paymentHash);
    } catch (e) {
      console.log(e);
    }
  }

  getPayment = async (paymentHash) => {
    try {
      return await this._storage.getPayment(paymentHash);
    } catch (e) {
      console.log(e);
    }
  }

  getAllPaymentHashes = async (stageHash) => {
    return await this._storage.getPaymentsByStageHash(stageHash);
  }

  saveRawPayment = (rawPayment) => {
    let key = this._makeUnsignedPayment(rawPayment).paymentHash;
    this._storage.setRawPayment(key, rawPayment);
  }

  savePayment = (payment) => {
    assert(payment.hasOwnProperty('paymentHash'), 'Payment should have key \'paymentHash\'');
    this._storage.setPayment(payment.paymentHash, payment);
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
      cipherClient: ciphers.cipherClient,
      cipherStakeholder: ciphers.cipherStakeholder
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

    if (!data.hasOwnProperty('pkClient') ||
        !data.hasOwnProperty('pkStakeholder')) {
      return false;
    }

    return true;
  }

  _computePaymentHashAndCiphers = (rawPayment) => {
    let crypto = this.ifc.crypto;
    let serializedRawPayment = Buffer.from(JSON.stringify(rawPayment)).toString('hex');
    let cipherClient = crypto.encrypt(serializedRawPayment, rawPayment.data.pkClient);
    let cipherStakeholder = crypto.encrypt(serializedRawPayment, rawPayment.data.pkStakeholder);
    let paymentHash = EthUtils.sha3(cipherClient + cipherStakeholder).toString('hex');

    return {
      paymentHash: paymentHash,
      ciphers: {
        cipherClient: cipherClient,
        cipherStakeholder: cipherStakeholder,
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
