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
    this.fetchContract();
    this._ifc = ifc;
    this.stageCache = [];
  }

  async fetchContract () {
    let contractAddress = null;
    try {
      let res = await this.getContractAddress();
      contractAddress = res.data.address;
      console.log(contractAddress);
    } catch (e) {
      console.error(e);
    }

    assert(contractAddress, 'Can not fetch contract address.');
    this.contractAddress = contractAddress;

    this._web3 = new Web3(new Web3.providers.HttpProvider(this._web3Url));
    this._ifcContract = this._web3.eth.contract(ifcJSON.abi).at(contractAddress);
  }

  getContractAddress = () => {
    let url = this._nodeUrl + '/contract/address/ifc';
    return axios.get(url);
  }

  pendingStages = () => {
    let url = this._nodeUrl + '/pending/stages';
    return axios.get(url);
  }

  pendingTransactions = () => {
    let url = this._nodeUrl + '/pending/transactions';
    return axios.get(url);
  }

  getIFCContract = async () => {
    return this._ifcContract;
  }

  getStage = async (stageHash) => {
    if(this.stageCache[stageHash]) {
      return this.stageCache[stageHash];
    }

    let stageContractAddress = await this._ifcContract.contract.getBlockAddress(stageHash);
    assert(stageContractAddress != 0, 'This stage contract does not exist.');

    let stageContract = this._web3.eth.contract(stageJSON.abi).at(stageContractAddress);
    this.stageCache[stageHash] = stageContract;

    return stageContract;
  }

  getStageRootHash = async (stageHash) => {
    let stage = this.getStage(stageHash);
    return stage.rootHash();
  }

  getLatestStageHeight = () => {
    let url = this._nodeUrl + '/latest/stage/height';
    return axios.get(url);
  }

  getTransaction = (scTxHash) => {
    let url = this._nodeUrl + '/transaction';
    return axios.get(url, {
      scTxHash: scTxHash
    });
  }

  getSlice = (stageHeight, txHash) => {
    let url = this._nodeUrl + '/slice';
    return axios.get(url, {
      stage_height: stageHeight,
      tx_hash: txHash
    });
  }

  _getIFCContractAddress = async () => {
    let url = this._nodeUrl + '/getIFCContractAddress';
    return axios.get(url);
  }
}

export default Sidechain;
