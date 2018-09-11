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

  getProposeDeposit = (rawData = {}) => {
    return new Promise((resolve, reject) => {
      this._infinitechain.event.getProposeDeposit(async (err, events) => {
        if (err) {
          reject(err);
        } else {
          let fee = rawData.fee? rawData.fee : 0;
          let metadata = rawData.metadata? rawData.metadata : null;
          let signedLightTxs = [];
          for (let i=0; i<events.length; i++) {
            let logID = events[i].returnValues._dsn;
            let nonce = this._getNonce();
            let value = events[i].returnValues._value;
            let assetID = events[i].returnValues._assetID;
            let lightTxData = {
              assetID: assetID,
              value: value,
              fee: fee,
              nonce: nonce,
              logID: logID,
              metadata: metadata
            };

            let signedLightTx = await this.makeLightTx(types.deposit, lightTxData, lightTxData.metadata);
            signedLightTxs.push(signedLightTx);
          }
          resolve(signedLightTxs);
        }
      });
    });
  }

  makeProposeDeposit = (rawData = {}) => {
    return new Promise(async (resolve, reject) => {
      this._infinitechain.event.onProposeDeposit(async (err, result) => {
        if (err) {
          reject(err);
        } else {
          let fee = rawData.fee? rawData.fee : 0;
          let metadata = rawData.metadata? rawData.metadata : null;
          let logID = result.returnValues._dsn;
          let nonce = this._getNonce();
          let value = result.returnValues._value;
          let assetID = result.returnValues._assetID;
          let lightTxData = {
            assetID: assetID,
            value: value,
            fee: fee,
            nonce: nonce,
            logID: logID,
            metadata: metadata
          };

          let signedLightTx = await this.makeLightTx(types.deposit, lightTxData, lightTxData.metadata);
          resolve(signedLightTx);
        }
      });
    });
  }

  proposeTokenDeposit = async (proposeData) => {
    let contract = this._infinitechain.contract;
    let txHash = await contract.proposeTokenDeposit(proposeData);
    return txHash;
  }

  makeProposeWithdrawal = async (rawData) => {
    assert(rawData.assetID != undefined, '\'assetID\' is not provided.');
    assert(rawData.value != undefined, '\'value\' is not provided.');
    let fee = rawData.fee? rawData.fee : 0;
    let metadata = rawData.metadata? rawData.metadata : null;
    let nonce = this._getNonce();
    let clientAddress = this._infinitechain.signer.getAddress();
    let normalizedClientAddress = clientAddress.slice(-40).padStart(64, '0').slice(-64);
    let logID = this._sha3(normalizedClientAddress + nonce);
    let lightTxData = {
      assetID: rawData.assetID,
      value: rawData.value,
      fee: fee,
      nonce: nonce,
      logID: logID,
      metadata: metadata
    };

    let signedLightTx = await this.makeLightTx(types.withdrawal, lightTxData, lightTxData.metadata);
    return signedLightTx;
  }

  makeLightTx = async (type, lightTxData, metadata = null) => {
    // Prepare lightTxData
    lightTxData = await this._prepare(type, lightTxData);
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

    // Sign lightTx
    let signer = this._infinitechain.signer;
    let signedLightTx = signer.signWithClientKey(lightTx);

    return signedLightTx;
  }

  saveReceipt = async (receipt, upload = false) => {
    assert(receipt instanceof Receipt, 'Parameter \'receipt\' should be instance of \'Receipt\'.');
    await this._storage.setReceipt(receipt.lightTxHash, receipt.toJson(), upload);
  }

  getReceipt = async (lightTxHash) => {
    try {
      return await this._storage.getReceipt(lightTxHash);
    } catch (e) {
      console.log(e);
    }
  }

  getBooterBalance = async (clientAddress, assetID = null) => {
    return await this._infinitechain.gringotts.getBoosterBalance(clientAddress, assetID);
  }

  getProof = async (stageHeight, receiptHash) => {
    return await this._infinitechain.gringotts.getProof(stageHeight, receiptHash);
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

  auidtReceiptProof = async (stageHeight, receiptHash, proof) => {
    let success = false;
    let contract = this._infinitechain.contract;
    // 1. Get receiptRootHash from blockchain
    let rootHashes = await contract.getStageRootHash(stageHeight);
    let receiptRootHash = rootHashes[0];
    // 2. Compute root hash
    let computedReceiptRootHash;
    if (proof.receiptHashArray.includes(receiptHash)) {
      computedReceiptRootHash = '0x' + this._computeRootHashFromSlice(proof.slice, stageHeight);
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
