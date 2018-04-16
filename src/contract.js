import Web3 from 'web3';
import EthUtils from 'ethereumjs-util';
import EthereumTx from 'ethereumjs-tx';
import InfinitechainManager from '@/abi/InfinitechainManager.json';
import Sidechain from '@/abi/Sidechain.json';
import assert from 'assert';

class Contract {
  constructor (config, infinitechain) {
    assert(config.web3Url != undefined, 'Opt should include web3Url.');
    assert(config.sidechainId > 0, 'Invalid \'sidechainId\'.');
    this._infinitechain = infinitechain;
    this._sidechainId = config.sidechainId;
    this._web3Url = config.web3Url;
    this._managerAddress = null;
    this._manager = null;
    this._key = infinitechain.signer.getPrivateKey();
    this._address = infinitechain.signer.getAddress();

    this._fetchManager();
  }

  manager = () => {
    return this._manager;
  }

  sidechain = () => {
    assert(this._manager != undefined, 'Infinitechain manager does not exist.');

    let sidechainAddress = this._manager.sidechainAddress(this._sidechainId);
    return this._web3.eth.contract(Sidechain.abi).at(sidechainAddress);
  }

  attach = (rootHash, stageHeight, objectionTime, finalizeTime, data, nonce = null) => {
    try {
      let stageHash = '0x' + this._sha3(stageHeight.toString());
      let txMethodData = this._infinitechainContract.addNewStage.getData(
        stageHash,
        rootHash,
        objectionTime,
        finalizeTime,
        data,
        { from: this._address }
      );
      let serializedTx = this._signRawTransaction(txMethodData, nonce);
      return serializedTx;
    } catch (e) {
      console.error(e);
    }
  }

  challenge = (payment) => {
    try {
      let stageHash = '0x' + payment.stageHash;
      let paymentHash = '0x' + payment.paymentHash;
      let txMethodData = this._infinitechainContract.takeObjection.getData(
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
      let txMethodData = this._infinitechainContract.finalize.getData(
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

  compensate = (stageHeight, paymentHashes) => {
    try {
      let stageHash = '0x' + this._sha3(stageHeight.toString());
      paymentHashes = paymentHashes.map(paymentHash => '0x' + paymentHash);
      let txMethodData = this._infinitechainContract.payPenalty.getData(
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

  defend = (stageHeight, paymentHash, treeNodeIndex, slice, collidingPaymentHashes) => {
    try {
      let stageHash = '0x' + this._sha3(stageHeight.toString());
      paymentHash = '0x' + paymentHash;
      slice = slice.map(h => '0x' + h);
      collidingPaymentHashes = collidingPaymentHashes.map(h => '0x' + h);
      let txMethodData = this._infinitechainContract.exonerate.getData(
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

  _signRawTransaction = (txMethodData, nonce = null) => {
    if (nonce === null) {
      nonce = this._web3.toHex(this._web3.eth.getTransactionCount(this._address));
    }

    let txParams = {
      nonce: nonce,
      gas: 4700000,
      from: this._address,
      to: this._infinitechainContract.address,
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

  _fetchManager = async () => {
    let managerAddress = null;
    try {
      let res = await this._infinitechain.gringotts.fetchManagerAddress();
      managerAddress = res.data.address;
    } catch (e) {
      console.error(e);
    }

    assert(managerAddress, 'Can not fetch contract address.');
    this._managerAddress = managerAddress;
    this._web3 = new Web3(new Web3.providers.HttpProvider(this._web3Url));
    this._manager = this._web3.eth.contract(InfinitechainManager.abi).at(managerAddress);
  }

  _sha3 = (content) => {
    return EthUtils.sha3(content).toString('hex');
  }
}

export default Contract;
