import EthUtils from 'ethereumjs-util';
import assert from 'assert';
import LightTransaction from '@/models/light-transaction';
import types from '@/models/types';

class Client {
  constructor (clientConfig, infinitechain) {
    this.serverAddress = clientConfig.serverAddress;
    this._infinitechain = infinitechain;
    this._storage = clientConfig.storage;
    this._nodeUrl = clientConfig.nodeUrl;
  }

  makeLightTx = async (type, lightTxData) => {
    // Normalize lightTxData
    lightTxData = await this._prepare(type, lightTxData);

    // Create lightTx
    let lightTx = new LightTransaction(lightTxData);

    // Sign lightTx
    let signer = this._infinitechain.signer;
    let signedLightTx = signer.signWithClientKey(lightTx);

    return signedLightTx;
  }

  proposeDeposit = async (lightTx, nonce = null) => {
    return this._infinitechain.contract.proposeDeposit(lightTx, nonce);
  }

  audit = async (paymentHash) => {
    try {
      let sidechain = this._infinitechain.sidechain;

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
    return this._infinitechain.sidechain.takeObjection(payment);
  }

  verifyPayment = async (payment) => {
    let crypto = this._infinitechain.crypto;

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
    return await this._storage.getPaymentHashesByStageHash(stageHash);
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

  _prepare = async (type, lightTxData) => {
    assert(Object.values(types).includes(type), 'Parameter \'type\' should be one of \'deposit\', \'withdrawal\', \'instantWithdraw\' or \'remittance\'');

    let gringotts = this._infinitechain.gringotts;
    let clientAddress = this._infinitechain.signer.getAddress();

    if (!lightTxData.stageHeight) {
      let sidechainHeight = await gringotts.getViableStageHeight();
      lightTxData.stageHeight = parseInt(sidechainHeight);
    }

    switch (type) {
    case types.deposit:
      lightTxData.from = '0';
      lightTxData.to = clientAddress;
      break;
    case types.withdrawal:
      break;
    case types.instantWithdrawal:
      break;
    case types.remittance:
      break;
    }
    return lightTxData;
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
    let crypto = this._infinitechain.crypto;
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
