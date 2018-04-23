import assert from 'assert';
import axios from 'axios';
import LightTransaction from '@/models/light-transaction';
import Receipt from '@/models/receipt';

class Gringotts {
  constructor (config, infinitechain) {
    assert(config.nodeUrl != undefined, 'Opt should include nodeUrl.');
    this._nodeUrl = config.nodeUrl;
    this._infinitechain = infinitechain;
  }

  slice = async (stageHeight, paymentHash) => {
    let url = this._nodeUrl + '/slice';
    return axios.get(url, {
      params: {
        stage_height: stageHeight,
        payment_hash: paymentHash
      }
    });
  }

  sendLightTx = async (lightTx) => {
    assert(lightTx instanceof LightTransaction, 'Parameter \'lightTx\' should be instance of LightTransaction.');
    let url = this._nodeUrl + '/send/light_tx';
    let res = await axios.post(url, { lightTxJson: lightTx.toJson() });
    let receiptJson = res.data;
    let receipt = new Receipt(receiptJson);

    return receipt;
  }

  getViableStageHeight = async () => {
    assert(this._nodeUrl, 'Can not find sidechain node.');
    let url = this._nodeUrl + '/viable/stage/height';
    let res = await axios.get(url);
    return parseInt(res.data.height);
  }

  fetchSidechainAddress = async () => {
    let url = this._nodeUrl + '/sidechain/address';
    return axios.get(url);
  }

  fetchServerAddress = async () => {
    let url = this._nodeUrl + '/server/address';
    return axios.get(url);
  }
}

export default Gringotts;
