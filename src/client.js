import EthUtils from 'ethereumjs-util';
import assert from 'assert';
import LightTransaction from '@/models/light-transaction';
import Receipt from '@/models/receipt';
import types from '@/models/types';

class Client {
  constructor (clientConfig, infinitechain) {
    this.serverAddress = clientConfig.serverAddress;
    this._infinitechain = infinitechain;
    this._storage = clientConfig.storage;
    this._nodeUrl = clientConfig.nodeUrl;
  }

  getProposeDeposit = (rawData = {}, address = null) => {
    return new Promise((resolve, reject) => {
      this._infinitechain.event.getProposeDeposit((err, events) => {
        if (err) {
          reject(err);
        } else {
          let fee = rawData.fee? rawData.fee : 0;
          let metadata = rawData.metadata? rawData.metadata : null;
          let lightTxs = [];
          for (let i = 0; i < events.length; i++) {
            let logID = events[i].returnValues._dsn;
            let to = address? address : this._infinitechain.signer.getAddress();
            let value = events[i].returnValues._value;
            let assetID = events[i].returnValues._assetID;
            let lightTxData = {
              to: to,
              assetID: assetID,
              value: value,
              fee: fee,
              logID: logID,
              metadata: metadata
            };

            let lightTx = this.makeLightTx(types.deposit, lightTxData, lightTxData.metadata);
            lightTxs.push(lightTx);
          }
          resolve(lightTxs);
        }
      }, address);
    });
  }

  makeProposeDeposit = (rawData = {}, address = null) => {
    return new Promise(async (resolve, reject) => {
      this._infinitechain.event.onProposeDeposit((err, result) => {
        if (err) {
          reject(err);
        } else {
          let fee = rawData.fee? rawData.fee : 0;
          let metadata = rawData.metadata? rawData.metadata : null;
          let logID = result.returnValues._dsn;
          let to = address? address : this._infinitechain.signer.getAddress();
          let value = result.returnValues._value;
          let assetID = result.returnValues._assetID;
          let lightTxData = {
            to: to,
            assetID: assetID,
            value: value,
            fee: fee,
            logID: logID,
            metadata: metadata
          };

          let lightTx = this.makeLightTx(types.deposit, lightTxData, lightTxData.metadata);
          resolve(lightTx);
        }
      }, address);
    });
  }

  proposeTokenDeposit = async (proposeData, privateKey = null) => {
    let contract = this._infinitechain.contract;
    let txHash = await contract.proposeTokenDeposit(proposeData, privateKey);
    return txHash;
  }

  makeProposeWithdrawal = (rawData, address = null) => {
    assert(rawData.assetID != undefined, '\'assetID\' is not provided.');
    assert(rawData.value != undefined, '\'value\' is not provided.');
    let fee = rawData.fee? rawData.fee : 0;
    let metadata = rawData.metadata? rawData.metadata : null;
    let from = address? address : this._infinitechain.signer.getAddress();
    let lightTxData = {
      from: from,
      assetID: rawData.assetID,
      value: rawData.value,
      fee: fee,
      metadata: metadata
    };

    let lightTx = this.makeLightTx(types.withdrawal, lightTxData, lightTxData.metadata);
    return lightTx;
  }

  makeLightTx = (type, lightTxData, metadata = null) => {
    // Prepare lightTxData
    lightTxData = this._prepare(type, lightTxData);
    if (metadata) {
      if (typeof metadata.client == 'object') {
        metadata.client = JSON.stringify(metadata.client);
      } else {
        metadata.client = metadata.client.toString();
      }
    }
    let lightTxJson = { lightTxData: lightTxData, metadata: metadata };

    // Create lightTx
    let lightTx = new LightTransaction(lightTxJson);
    // Sign lightTx if has privateKey
    let signer = this._infinitechain.signer;
    if (signer.hasPrivateKey()) {
      lightTx = signer.signWithClientKey(lightTx);
    }
    return lightTx;
  }

  signLightTx = (lightTx, privateKey = null) => {
    if (typeof lightTx == 'string') lightTx == JSON.parse(lightTx);
    if (typeof lightTx.metadata.client == 'object') {
      lightTx.metadata.client = JSON.stringify(lightTx.metadata.client);
    } else {
      lightTx.metadata.client = lightTx.metadata.client.toString();
    }
    lightTx = new LightTransaction(lightTx);
    // Sign lightTx
    let signer = this._infinitechain.signer;
    let signedLightTx = signer.signWithClientKey(lightTx, privateKey);

    return signedLightTx;
  }

  saveReceipt = async (receipt, upload = false) => {
    assert(receipt instanceof Receipt, 'Parameter \'receipt\' should be instance of \'Receipt\'.');
    await this._storage.setReceipt(receipt.receiptHash, receipt.toJson(), upload);
  }

  getReceipt = async (receiptHash) => {
    try {
      return await this._storage.getReceipt(receiptHash);
    } catch (e) {
      throw e;
    }
  }

  getBooterBalance = async (clientAddress, assetID = null) => {
    return await this._infinitechain.gringotts.getBoosterBalance(clientAddress, assetID);
  }

  getSlice = async (stageHeight, receiptHash) => {
    return await this._infinitechain.gringotts.getSlice(stageHeight, receiptHash);
  }

  getAllReceiptHashes = async (stageHeight) => {
    return await this._storage.getReceiptHashesByStageHeight(stageHeight);
  }

  takeObjection = async (payment) => {
    return this._infinitechain.booster.takeObjection(payment);
  }

  _sha3 (content) {
    return EthUtils.sha3(content).toString('hex');
  }

  _prepare = (type, lightTxData) => {
    assert(Object.values(types).includes(type), 'Parameter \'type\' should be one of \'deposit\', \'withdrawal\', \'instantWithdraw\' or \'remittance\'');

    lightTxData.nonce = this._getNonce();
    switch (type) {
      case types.deposit:
        lightTxData.from = '0';
        lightTxData.fee = '0';
        break;
      case types.withdrawal:
      case types.instantWithdrawal:
        lightTxData.to = '0';
        let normalizedClientAddress = lightTxData.from.slice(-40).padStart(64, '0').slice(-64);
        lightTxData.logID = this._sha3(normalizedClientAddress + lightTxData.nonce);
        break;
      case types.remittance:
        lightTxData.logID = '0';
        break;
    }
    return lightTxData;
  }

  _getNonce () {
    return this._sha3((Math.random()).toString());
  }

  getSyncerToken = async () => {
    return await this._storage.getSyncerToken();
  }

  refreshToken = async (token) => {
    await this._storage.saveSyncerToken(token);
  }

  syncReceipts = async () => {
    await this._storage.syncReceipts();
  }

  fetchSupportedTokens = async () => {
    return await this._infinitechain.gringotts.getAssetList();
  }

  auidtReceiptSlice = async (stageHeight, receiptHash, slice) => {
    let success = false;
    let contract = this._infinitechain.contract;
    stageHeight = parseInt(stageHeight);
    // 1. Get receiptRootHash from blockchain
    let rootHashes = await contract.getStageRootHash(stageHeight);
    let receiptRootHash = rootHashes[0];
    // 2. Compute root hash
    let computedReceiptRootHash;
    if (slice.receiptHashArray.includes(receiptHash)) {
      computedReceiptRootHash = '0x' + this._computeRootHashFromSlice(slice.slice, stageHeight);
      // 3. Compare
      if (computedReceiptRootHash == receiptRootHash) {
        success = true;
      }
    }
    return success;
  }

  _computeRootHashFromSlice (slice, stageHeight) {
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

    return this._sha3(rootNode.treeNodeHash + stageHeight.toString(16).padStart(64, '0'));
  }
}

export default Client;
