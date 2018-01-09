import Web3 from 'web3';
import ifcJSON from '@/abi/ifc.js';
import stageJSON from '@/abi/stage.js';
import assert from 'assert';
import axios from 'axios';

class Sidechain {
  constructor (opt, ifc) {
    assert(opt.web3Url != undefined, 'Opt shouldd include web3Url.');    
    assert(opt.nodeUrl != undefined, 'Opt shouldd include nodeUrl.');
    this._web3Url = opt.web3Url;
    this._nodeUrl = opt.nodeUrl;
    this._ifc = ifc;

    let IFCContractAddress = this._getIFCContractAddress;

    this._web3 = new Web3(new Web3.providers.HttpProvider(this._web3Url));
    this._ifcObj = this._web3.eth.contract(ifcJSON.abi).at(IFCContractAddress);
    this.stageObjCache = [];
  }

  pendingStages = async () => {
    let url = this._nodeUrl + '/pending/stages';
    let res = await axios.get(url).
      then((res) => console.log(res));
    return res;
  }

  pendingTransactions = async () => {
    let url = this._nodeUrl + '/pending/transactions';
    let res = await axios.get(url).
      then((res) => console.log(res));
    return res;
  }

  getIFCContract = async () => {
    return this._ifcObj;
  }

  getStage = async (stageHash) => {
    let stageObj = this._getOrNewStageObj(stageHash);
    return stageObj;
  }

  getStageRootHash = async (stageHash) => {
    let stage = this.getStage(stageHash);
    return stage.rootHash();
  }

  getLatestStageHeight = async () => {
    let url = this._nodeUrl + '/latest/stage/height';
    let res = await axios.get(url).
      then((res) => console.log(res));
    return res;
  }

  getTransaction = async (scTxHash) => {
    let url = this._nodeUrl + '/transaction';
    let res = await axios.get(url, {
      params: {
        scTxHash: scTxHash
      }
    }).
      then((res) => console.log(res));
    return res;
  }

  getSlice = async (stageHeight, txHash) => {
    let url = this._nodeUrl + '/slice';
    let res = await axios.get(url, {
      params: {
        stage_height: stageHeight,
        tx_hash: txHash
      }
    }).
      then((res) => console.log(res));
    return res;
  }

  sendTransactions = async (txs) => {
    let url = this._nodeUrl + '/send/transactions';
    let res = await axios.post(url, {
      params: {
        txs: txs
      }
    }).
      then((res) => console.log(res));
    return res;
  }

  commitTransactions = async () => {
    let url = this._nodeUrl + '/commit/transactions';
    let res = await axios.post(url).
      then((res) => console.log(res));
    return res;
  }

  _getIFCContractAddress = async () => {
    let url = this._nodeUrl + '/getIFCContractAddress';
    let res = await axios.get(url).body;
    return res;
  }

  _getOrNewStageObj = async (stageHash) => {
    // Check if stageObj is in cache
    if(this.stageObjCache[stageHash]) {
      return this.stageObjCache[stageHash];
    }

    let stageContractAddress = await this._ifcObj.contract.getBlockAddress(stageHash);
    assert(stageContractAddress != 0, 'This stage contract does not exist.');

    let stageObj = this._web3.eth.contract(stageJSON.abi).at(stageContractAddress);

    // Cache stageObj
    this.stageObjCache[stageHash] = stageObj;

    return stageObj;
  }
}

export default Sidechain;
