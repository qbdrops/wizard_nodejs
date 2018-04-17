import assert from 'assert';
import axios from 'axios';

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

  getViableStageHeight = async () => {
    assert(this._nodeUrl, 'Can not find sidechain node.');
    let url = this._nodeUrl + '/viable/stage/height';
    let res = await axios.get(url);
    return parseInt(res.data.height);
  }

  fetchSidechainAddress = async () => {
    let url = this._nodeUrl + '/contract/address';
    return axios.get(url);
  }
}

export default Gringotts;
