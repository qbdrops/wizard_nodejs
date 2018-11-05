import assert from 'assert';
import axios from 'axios';
import LightTransaction from '@/models/light-transaction';
import Receipt from '@/models/receipt';

class Gringotts {
  constructor (config, infinitechain) {
    this._nodeUrl = config.nodeUrl;
    this._infinitechain = infinitechain;
  }

  getSlice = async (stageHeight, receiptHash) => {
    let url = this._nodeUrl + '/slice/' + stageHeight + '/' + receiptHash;
    return await axios.get(url);
  }

  getTrees = async (stageHeight) => {
    let url = this._nodeUrl + '/trees';
    return await axios.get(url, {
      params: {
        stage_height: stageHeight
      }
    });
  }

  sendLightTx = async (lightTx) => {
    assert(lightTx instanceof LightTransaction, 'Parameter \'lightTx\' should be instance of LightTransaction.');
    let url = this._nodeUrl + '/send/light_tx';
    let res = await axios.post(url, { lightTxJson: lightTx.toJson() });
    res = res.data;
    if (res.ok) {
      let receiptJson = res.receipt;
      let receipt = new Receipt(receiptJson);

      return receipt;
    } else {
      throw new Error(`message: ${res.message}, code: ${res.code} `);
    }
  }

  getViableStageHeight = async () => {
    assert(this._nodeUrl, 'Can not find booster node.');
    let url = this._nodeUrl + '/viable/stage/height';
    let res = await axios.get(url);
    return parseInt(res.data.height);
  }

  fetchBoosterAddress = async () => {
    let url = this._nodeUrl + '/booster/address';
    return await axios.get(url);
  }

  fetchServerAddress = async () => {
    let url = this._nodeUrl + '/server/address';
    return await axios.get(url);
  }

  fetchRootHashes = async (stageHeight = null) => {
    let url = this._nodeUrl + '/roothash';
    if (stageHeight) {
      url = url + '/' + stageHeight.toString();
    }

    return await axios.get(url);
  }

  getOffchainReceipts = async (stageHeight) => {
    let url = this._nodeUrl + '/receipts/' + stageHeight;
    return await axios.get(url);
  }

  getOffchainReceiptByGSN = async (GSN) => {
    if (typeof GSN === 'number') {
      GSN = parseInt(GSN).toString(16);
    }
    let url = this._nodeUrl + '/receipt_by_gsn/' + GSN;
    return axios.get(url);
  }

  getAccountBalances = async (stageHeight) => {
    let url = this._nodeUrl + '/accounts/' + stageHeight;
    return await axios.get(url);
  }

  getBoosterBalance = async (clientAddress, assetID = null) => {
    let url;
    if (!assetID) {
      url = this._nodeUrl + '/balance/' + clientAddress;
    } else {
      url = this._nodeUrl + '/balance/' + clientAddress + '?assetID=' + assetID;
    }
    return await axios.get(url);
  }

  getAssetList = async () => {
    let url = this._nodeUrl + '/assetlist';
    let res = await axios.get(url);
    return res.data.assetList;
  }
}

export default Gringotts;
