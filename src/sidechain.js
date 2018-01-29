import Web3 from 'web3';
import EthUtils from 'ethereumjs-util';
import EthereumTx from 'ethereumjs-tx';
import ifcJSON from '@/abi/ifc.js';
import assert from 'assert';
import axios from 'axios';

class Sidechain {
  constructor (opt, ifc) {
    assert(opt.web3Url != undefined, 'Opt shouldd include web3Url.');
    assert(opt.nodeUrl != undefined, 'Opt shouldd include nodeUrl.');

    this._web3Url = opt.web3Url;
    this._nodeUrl = opt.nodeUrl;
    this._fetchContract();
    this._ifc = ifc;
    this.stageCache = [];

    let keyInfo = ifc.crypto.keyInfo();
    this._key = keyInfo.eccPrivateKey;
    this._address = keyInfo.address;
  }

  getIFCContract = () => {
    return this._ifcContract;
  }

  finalize = async (stageHeight) => {
    let stageHash = '0x' + EthUtils.sha3(stageHeight.toString()).toString('hex');
    let txMethodData = this._ifcContract.finalize.getData(
      stageHash,
      { from: this._address }
    );
    let serializedTx = this._signRawTransaction(txMethodData);
    let txHash = await this._web3.eth.sendRawTransaction(serializedTx);
    return txHash;
  }

  _signRawTransaction = (txMethodData) => {
    let newNonce = this._web3.toHex(this._web3.eth.getTransactionCount(this._address));

    let txParams = {
      nonce: newNonce,
      gas: 4700000,
      from: this._address,
      to: this._ifcContract.address,
      data: txMethodData
    };

    let tx = new EthereumTx(txParams);
    let key = this._key.substring(2);
    tx.sign(Buffer.from(key, 'hex'));
    let serializedTx = '0x' + tx.serialize().toString('hex');

    return serializedTx;
  }

  _fetchContract = async () => {
    let contractAddress = null;
    try {
      let res = await this._getContractAddress();
      contractAddress = res.data.address;
    } catch (e) {
      console.error(e);
    }
    
    assert(contractAddress, 'Can not fetch contract address.');
    this.contractAddress = contractAddress;
    
    this._web3 = new Web3(new Web3.providers.HttpProvider(this._web3Url));
    this._ifcContract = this._web3.eth.contract(ifcJSON.abi).at(contractAddress);
  }

  _getContractAddress = async () => {
    let url = this._nodeUrl + '/contract/address/ifc';
    return axios.get(url);
  }

  // pendingStages = async () => {
  //   let url = this._nodeUrl + '/pending/stages';
  //   return axios.get(url);
  // }

  // pendingPayments = () => {
  //   let url = this._nodeUrl + '/pending/payments';
  //   return axios.get(url);
  // }

  // getStage = async (stageHash) => {
  //   if(this.stageCache[stageHash]) {
  //     return this.stageCache[stageHash];
  //   }

  //   let stageContractAddress = await this._ifcContract.getStageAddress(stageHash);
  //   assert(stageContractAddress != 0, 'This stage contract does not exist.');

  //   let stageContract = this._web3.eth.contract(stageJSON.abi).at(stageContractAddress);
  //   this.stageCache[stageHash] = stageContract;

  //   return stageContract;
  // }

  // getStageRootHash = async (stageHash) => {
  //   let stage = this.getStage(stageHash);
  //   return stage.rootHash();
  // }

  // getLatestStageHeight = () => {
  //   let url = this._nodeUrl + '/latest/stage/height';
  //   return axios.get(url);
  // }

  // getPayment = (paymentHash) => {
  //   let url = this._nodeUrl + '/payment';
  //   return axios.get(url, {
  //     paymentHash: paymentHash
  //   });
  // }
}

export default Sidechain;
