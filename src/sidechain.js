import Web3 from 'web3';
import EthUtils from 'ethereumjs-util';
import EthereumTx from 'ethereumjs-tx';
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

  getStage = async (stageHash) => {
    if(this.stageCache[stageHash]) {
      return this.stageCache[stageHash];
    }

    let stageContractAddress = await this._ifcContract.getStageAddress(stageHash);
    assert(stageContractAddress != 0, 'This stage contract does not exist.');

    let stageContract = this._web3.eth.contract(stageJSON.abi).at(stageContractAddress);
    this.stageCache[stageHash] = stageContract;

    return stageContract;
  }

  getSlice = async (stageHeight, paymentHash) => {
    let url = this._nodeUrl + '/slice';
    return axios.get(url, {
      params: {
        stage_height: stageHeight,
        payment_hash: paymentHash
      }
    });
  }

  addNewStage = (rootHash, stageHeight, objectionTime, finalizeTime, data) => {
    try {
      let stageHash = '0x' + this._sha3(stageHeight.toString());
      let txMethodData = this._ifcContract.addNewStage.getData(
        stageHash,
        rootHash,
        objectionTime,
        finalizeTime,
        data,
        { from: this._address }
      );
      let serializedTx = this._signRawTransaction(txMethodData);
      return serializedTx;
    } catch (e) {
      console.error(e);
    }
  }

  takeObjection = (payment) => {
    try {
      let stageHash = '0x' + payment.stageHash;
      let paymentHash = '0x' + payment.paymentHash;
      let txMethodData = this._ifcContract.takeObjection.getData(
        [stageHash, paymentHash],
        payment.v,
        payment.r,
        payment.s,
        { from: this._address }
      );
      let serializedTx = this._signRawTransaction(txMethodData);
      let txHash = this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      console.error(e);
    }
  }

  finalize = (stageHeight) => {
    try {
      let stageHash = '0x' + this._sha3(stageHeight.toString());
      let txMethodData = this._ifcContract.finalize.getData(
        stageHash,
        { from: this._address }
      );
      let serializedTx = this._signRawTransaction(txMethodData);
      let txHash = this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      console.error(e);
    }
  }

  payPenalty = (stageHeight, paymentHashes) => {
    try {
      let stageHash = '0x' + this._sha3(stageHeight.toString());
      paymentHashes = paymentHashes.map(paymentHash => '0x' + paymentHash);
      let txMethodData = this._ifcContract.payPenalty.getData(
        stageHash,
        paymentHashes,
        '', // Work around! To prevent solidity invalid argument error.
        { from: this._address }
      );
      let serializedTx = this._signRawTransaction(txMethodData);
      let txHash = this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      console.error(e);
    }
  }

  exonerate = (stageHeight, paymentHash, treeNodeIndex, slice, collidingPaymentHashes) => {
    try {
      let stageHash = '0x' + this._sha3(stageHeight.toString());
      paymentHash = '0x' + paymentHash;
      slice = slice.map(h => '0x' + h);
      collidingPaymentHashes = collidingPaymentHashes.map(h => '0x' + h);
      let txMethodData = this._ifcContract.exonerate.getData(
        stageHash,
        paymentHash,
        treeNodeIndex,
        slice,
        collidingPaymentHashes,
        { from: this._address }
      );

      let serializedTx = this._signRawTransaction(txMethodData);
      let txHash = this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      console.error(e);
    }
  }

  // Sidechain status getter

  getLatestStageHeight = () => {
    assert(this._ifcContract, 'Can not find contract.');
    return this._ifcContract.stageHeight();
  }

  getStageRootHash = async (stageHash) => {
    let stage = await this.getStage(stageHash);
    return stage.rootHash();
  }

  getObjectionablePaymentHashes = async (stageHash) => {
    let stage = await this.getStage(stageHash);
    return stage.getObjectionablePaymentHashes();
  }

  getObjection = async (stageHash, paymentHash) => {
    let stage = await this.getStage(stageHash);
    let objection = stage.objections(paymentHash);
    return {
      clientAddress: objection[0],
      objectionSuccess: objection[1],
      getCompensation: objection[2]
    };
  }

  isStageFinalized = async (stageHash) => {
    let stage = await this.getStage(stageHash);
    return stage.completed();
  }

  // pendingStages = async () => {
  //   let url = this._nodeUrl + '/pending/stages';
  //   return axios.get(url);
  // }

  // pendingPayments = () => {
  //   let url = this._nodeUrl + '/pending/payments';
  //   return axios.get(url);
  // }

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

  _sendRawTransaction = (serializedTx) => {
    let txHash = this._web3.eth.sendRawTransaction(serializedTx);
    return txHash;
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

  _sha3 = (content) => {
    return EthUtils.sha3(content).toString('hex');
  }

}

export default Sidechain;
