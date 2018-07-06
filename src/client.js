import EthUtils from 'ethereumjs-util';
import assert from 'assert';
import LightTransaction from '@/models/light-transaction';
import Receipt from './models/receipt';
import types from '@/models/types';

class Client {
  constructor (clientConfig, infinitechain) {
    this.serverAddress = clientConfig.serverAddress;
    this._infinitechain = infinitechain;
    this._storage = clientConfig.storage;
    this._nodeUrl = clientConfig.nodeUrl;
  }

  makeProposeDeposit = (assetID) => {
    if (!assetID) {
      assetID = 0;
    }
    return new Promise((resolve, reject) => {
      this._infinitechain.event.onProposeDeposit(async (err, result) => {
        if (err) {
          reject(err);
        } else {
          let logID = result.args._dsn;
          let nonce = this._getNonce();
          let value = result.args._value;
          let lightTxData = {
            assetID: assetID,
            value: value,
            fee: 0.01,
            nonce: nonce,
            logID: logID
          };

          let signedLightTx = await this.makeLightTx(types.deposit, lightTxData);
          resolve(signedLightTx);
        }
      });
    });
  }

  makeProposeWithdrawal = async (assetID, value) => {
    if (!assetID) {
      assetID = 0;
    }
    let nonce = this._getNonce();
    let clientAddress = this._infinitechain.signer.getAddress();
    let normalizedClientAddress = clientAddress.slice(-40).padStart(64, '0').slice(-64);
    let logID = this._sha3(normalizedClientAddress + nonce);
    let lightTxData = {
      assetID: assetID,
      value: value,
      fee: 0.01,
      nonce: nonce,
      logID: logID
    };

    let signedLightTx = await this.makeLightTx(types.withdrawal, lightTxData);
    return signedLightTx;
  }

  makeLightTx = async (type, lightTxData, metadata = null) => {
    // Prepare lightTxData
    lightTxData = await this._prepare(type, lightTxData);

    let lightTxJson = { lightTxData: lightTxData, metadata: metadata };

    // Create lightTx
    let lightTx = new LightTransaction(lightTxJson);

    // Sign lightTx
    let signer = this._infinitechain.signer;
    let signedLightTx = signer.signWithClientKey(lightTx);

    return signedLightTx;
  }

  saveLightTx = async (lightTx) => {
    assert(lightTx instanceof LightTransaction, 'Parameter \'lightTx\' should be instance of \'LightTransaction\'.');
    await this._storage.setLightTx(lightTx.lightTxHash, lightTx.toJson());
  }

  saveReceipt = async (receipt) => {
    assert(receipt instanceof Receipt, 'Parameter \'receipt\' should be instance of \'Receipt\'.');
    await this._storage.setReceipt(receipt.receiptHash, receipt.toJson());
  }

  getLightTx = async (lightTxHash) => {
    try {
      return await this._storage.getLightTx(lightTxHash);
    } catch (e) {
      console.log(e);
    }
  }

  getReceipt = async (receiptHash) => {
    try {
      return await this._storage.getReceipt(receiptHash);
    } catch (e) {
      console.log(e);
    }
  }

  getAllReceiptHashes = async (stageHeight) => {
    return await this._storage.getReceiptHashesByStageHeight(stageHeight);
  }

  audit = async (lightTxHash, customLogic) => {
    try {
      let booster = this._infinitechain.booster;

      // Get payment from storage
      let payment = await this.getPayment(lightTxHash);

      // 1. Get slice and compute root hash
      let body = await booster.getSlice(payment.stageHeight, lightTxHash);
      let slice = body.data.slice;
      let lightTxHashArray = body.data.lightTxHashArray;
      var localStageRootHash = '';
      if (lightTxHashArray.includes(lightTxHash)) {

        localStageRootHash = '0x' + this._computeRootHashFromSlice(slice);
        // 2. Get root hash from blockchain
        let stageHash = '0x' + payment.stageHash;
        let stageRootHash = await booster.getStageRootHash(stageHash);

        // 3. Check if custom rewrite the business logic function and compare
        if (typeof customLogic === "function"){
          let businessLogicBool = customLogic();
          return (businessLogicBool && (localStageRootHash == stageRootHash));
        } else {
          return (localStageRootHash == stageRootHash);
        }
          
      } else {
        return false;
      }
    } catch (e) {
      console.error(e);
    }
  }

  takeObjection = async (payment) => {
    return this._infinitechain.booster.takeObjection(payment);
  }

  _sha3 (content) {
    return EthUtils.sha3(content).toString('hex');
  }

  _prepare = async (type, lightTxData) => {
    assert(Object.values(types).includes(type), 'Parameter \'type\' should be one of \'deposit\', \'withdrawal\', \'instantWithdraw\' or \'remittance\'');

    let clientAddress = this._infinitechain.signer.getAddress();

    switch (type) {
    case types.deposit:
      lightTxData.from = '0';
      lightTxData.to = clientAddress;
      break;
    case types.withdrawal:
      lightTxData.from = clientAddress;
      lightTxData.to = '0';
      break;
    case types.instantWithdrawal:
      lightTxData.from = clientAddress;
      lightTxData.to = '0';
      break;
    case types.remittance:
      lightTxData.nonce = this._getNonce();
      lightTxData.logID = '0';
      break;
    }
    return lightTxData;
  }

  _getNonce () {
    return this._sha3((Math.random()).toString());
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

    let lightTxHashAndCiphers = this._computeLightTxHashAndCiphers(rawPayment);
    let lightTxHash = lightTxHashAndCiphers.lightTxHash;
    let ciphers = lightTxHashAndCiphers.ciphers;

    return {
      stageHeight: rawPayment.stageHeight,
      stageHash: stageHash.toString('hex'),
      lightTxHash: lightTxHash.toString('hex'),
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

  _computeLightTxHashAndCiphers = (rawPayment) => {
    let crypto = this._infinitechain.crypto;
    let serializedRawPayment = Buffer.from(JSON.stringify(rawPayment)).toString('hex');
    let cipherClient = crypto.encrypt(serializedRawPayment, rawPayment.data.pkClient);
    let cipherStakeholder = crypto.encrypt(serializedRawPayment, rawPayment.data.pkStakeholder);
    let lightTxHash = EthUtils.sha3(cipherClient + cipherStakeholder).toString('hex');

    return {
      lightTxHash: lightTxHash,
      ciphers: {
        cipherClient: cipherClient,
        cipherStakeholder: cipherStakeholder,
      }
    };
  }

  _computeTreeNodeHash = (lightTxHashArray) => {
    let hash = lightTxHashArray.reduce((acc, curr) => {
      return acc.concat(curr);
    });

    return this._sha3(hash);
  }
}

export default Client;
