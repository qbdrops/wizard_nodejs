import Web3 from 'web3';
import EthUtils from 'ethereumjs-util';
import EthereumTx from 'ethereumjs-tx';
import Booster from '@/abi/Booster.json';
import assert from 'assert';
import Receipt from '@/models/receipt';

class Contract {
  constructor (config, infinitechain) {
    this._infinitechain = infinitechain;
    this._web3Url = config.web3Url;
    this._boosterAddress = null;
    this._booster = null;
  }

  fetchBooster = async () => {
    let boosterAddress = null;
    try {
      let res = await this._infinitechain.gringotts.fetchBoosterAddress();
      boosterAddress = res.data.address;
    } catch (e) {
      console.error(e);
    }

    assert(boosterAddress, 'Can not fetch booster address.');
    this._boosterAddress = boosterAddress;
    this._web3 = new Web3(new Web3.providers.HttpProvider(this._web3Url));
    this._booster = this._web3.eth.contract(Booster.abi).at(boosterAddress);
  }

  booster = () => {
    assert(this._booster, 'Infinitechain is not initialized yet');
    return this._booster;
  }

  web3 = () => {
    assert(this._web3, 'Infinitechain is not initialized yet');
    return this._web3;
  }

  proposeWithdrawal = (receipt, nonce = null) => {
    assert(receipt instanceof Receipt, 'Parameter \'lightTx\' should be instance of Receipt.');

    let txValue = '0x0';
    let clientAddress = '0x' + this._infinitechain.signer.getAddress();
    let boosterAddress = this._boosterAddress;

    try {
      let txMethodData = this.booster().delegateToCryptoFlowLib.getData(
        '0x68ff1929',
        [
          '0x' + receipt.lightTxHash,
          '0x' + receipt.lightTxData.from,
          '0x' + receipt.lightTxData.to,
          '0x' + receipt.lightTxData.assetID,
          '0x' + receipt.lightTxData.value,
          '0x' + receipt.lightTxData.fee,
          '0x' + receipt.lightTxData.nonce,
          '0x' + receipt.lightTxData.logID,
          '0x' + receipt.lightTxData.clientMetadataHash,
          receipt.sig.clientLightTx.v,
          receipt.sig.clientLightTx.r,
          receipt.sig.clientLightTx.s,
          '0x' + receipt.receiptData.GSN,
          '0x' + receipt.receiptData.fromBalance,
          '0x' + receipt.receiptData.toBalance,
          '0x' + receipt.receiptData.serverMetadataHash,
          receipt.sig.serverLightTx.v,
          receipt.sig.serverLightTx.r,
          receipt.sig.serverLightTx.s,
          receipt.sig.serverReceipt.v,
          receipt.sig.serverReceipt.r,
          receipt.sig.serverReceipt.s,
        ]
      );
      let serializedTx = this._signRawTransaction(txMethodData, clientAddress, boosterAddress, txValue, nonce);
      let txHash = this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      console.error(e);
    }
  }

  deposit = (receipt, nonce = null) => {
    assert(receipt instanceof Receipt, 'Parameter \'lightTx\' should be instance of Receipt.');

    let txValue = '0x0';
    let clientAddress = '0x' + this._infinitechain.signer.getAddress();
    let boosterAddress = this._boosterAddress;

    try {
      let txMethodData = this.booster().delegateToCryptoFlowLib.getData(
        '0x7b9d7d74',
        [
          '0x' + receipt.lightTxHash,
          '0x' + receipt.lightTxData.from,
          '0x' + receipt.lightTxData.to,
          '0x' + receipt.lightTxData.assetID,
          '0x' + receipt.lightTxData.value,
          '0x' + receipt.lightTxData.fee,
          '0x' + receipt.lightTxData.nonce,
          '0x' + receipt.lightTxData.logID,
          '0x' + receipt.lightTxData.clientMetadataHash,
          receipt.sig.clientLightTx.v,
          receipt.sig.clientLightTx.r,
          receipt.sig.clientLightTx.s,
          '0x' + receipt.receiptData.GSN,
          '0x' + receipt.receiptData.fromBalance,
          '0x' + receipt.receiptData.toBalance,
          '0x' + receipt.receiptData.serverMetadataHash,
          receipt.sig.serverLightTx.v,
          receipt.sig.serverLightTx.r,
          receipt.sig.serverLightTx.s,
          receipt.sig.serverReceipt.v,
          receipt.sig.serverReceipt.r,
          receipt.sig.serverReceipt.s
        ]
      );

      let serializedTx = this._signRawTransaction(txMethodData, clientAddress, boosterAddress, txValue, nonce);
      let txHash = this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      console.error(e);
    }
  }

  withdraw = (receipt, nonce = null) => {
    let txValue = '0x0';
    let clientAddress = '0x' + this._infinitechain.signer.getAddress();
    let boosterAddress = this._boosterAddress;

    try {
      let txMethodData = this.booster().delegateToCryptoFlowLib.getData(
        '0xfe2b3924',
        [
          '0x' + receipt.lightTxHash
        ]
      );

      let serializedTx = this._signRawTransaction(txMethodData, clientAddress, boosterAddress, txValue, nonce);
      let txHash = this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      console.error(e);
    }
  }

  instantWithdraw = (receipt, nonce = null) => {
    assert(receipt instanceof Receipt, 'Parameter \'lightTx\' should be instance of Receipt.');

    let txValue = '0x0';
    let clientAddress = '0x' + this._infinitechain.signer.getAddress();
    let boosterAddress = this._boosterAddress;

    try {
      let txMethodData = this.booster().delegateToCryptoFlowLib.getData(
        '0xbe1946da',
        [
          '0x' + receipt.lightTxHash,
          '0x' + receipt.lightTxData.from,
          '0x' + receipt.lightTxData.to,
          '0x' + receipt.lightTxData.assetID,
          '0x' + receipt.lightTxData.value,
          '0x' + receipt.lightTxData.fee,
          '0x' + receipt.lightTxData.nonce,
          '0x' + receipt.lightTxData.logID,
          '0x' + receipt.lightTxData.clientMetadataHash,
          receipt.sig.clientLightTx.v,
          receipt.sig.clientLightTx.r,
          receipt.sig.clientLightTx.s,
          '0x' + receipt.receiptData.GSN,
          '0x' + receipt.receiptData.fromBalance,
          '0x' + receipt.receiptData.toBalance,
          '0x' + receipt.receiptData.serverMetadataHash,
          receipt.sig.serverLightTx.v,
          receipt.sig.serverLightTx.r,
          receipt.sig.serverLightTx.s,
          receipt.sig.serverReceipt.v,
          receipt.sig.serverReceipt.r,
          receipt.sig.serverReceipt.s
        ]
      );

      let serializedTx = this._signRawTransaction(txMethodData, clientAddress, boosterAddress, txValue, nonce);
      let txHash = this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      console.error(e);
    }
  }

  attach = (receiptRootHash, accountRootHash, data, nonce = null) => {
    let txValue = '0x0';
    let clientAddress = '0x' + this._infinitechain.signer.getAddress();
    let boosterAddress = this._boosterAddress;

    try {
      let txMethodData = this.booster().delegateToChallengedLib.getData(
        '0x95aa4aac',
        [
          '0x' + receiptRootHash,
          '0x' + accountRootHash,
          '0x' + data
        ]
      );
      let serializedTx = this._signRawTransaction(txMethodData, clientAddress, boosterAddress, txValue, nonce);
      return serializedTx;
    } catch (e) {
      console.error(e);
    }
  }

  challenge = (payment) => {
    try {
      let stageHash = '0x' + payment.stageHash;
      let lightTxHash = '0x' + payment.lightTxHash;
      let txMethodData = this._infinitechainContract.takeObjection.getData(
        [stageHash, lightTxHash],
        payment.v,
        payment.r,
        payment.s
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
        stageHash
      );
      let serializedTx = this._signRawTransaction(txMethodData);
      let txHash = this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      console.error(e);
    }
  }

  compensate = (stageHeight, lightTxHashes) => {
    try {
      let stageHash = '0x' + this._sha3(stageHeight.toString());
      lightTxHashes = lightTxHashes.map(lightTxHash => '0x' + lightTxHash);
      let txMethodData = this._infinitechainContract.payPenalty.getData(
        stageHash,
        lightTxHashes,
        '' // Work around! To prevent solidity invalid argument error.
      );
      let serializedTx = this._signRawTransaction(txMethodData);
      let txHash = this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      console.error(e);
    }
  }

  defend = (stageHeight, lightTxHash, treeNodeIndex, slice, collidingLightTxHashes) => {
    try {
      let stageHash = '0x' + this._sha3(stageHeight.toString());
      lightTxHash = '0x' + lightTxHash;
      slice = slice.map(h => '0x' + h);
      collidingLightTxHashes = collidingLightTxHashes.map(h => '0x' + h);
      let txMethodData = this._infinitechainContract.exonerate.getData(
        stageHash,
        lightTxHash,
        treeNodeIndex,
        slice,
        collidingLightTxHashes
      );

      let serializedTx = this._signRawTransaction(txMethodData);
      let txHash = this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      console.error(e);
    }
  }

  getStageRootHash = async (stageHeight) => {
    let rootHashes = await this._booster.stages(stageHeight);
    return rootHashes;
  }

  getObjectionableLightTxHashes = async (stageHash) => {
    let stage = await this.getStage(stageHash);
    return stage.getObjectionableLightTxHashes();
  }

  getObjection = async (stageHash, lightTxHash) => {
    let stage = await this.getStage(stageHash);
    let objection = stage.objections(lightTxHash);
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

  _signRawTransaction = (txMethodData, from, to, value, nonce = null) => {
    if (nonce == null) {
      let address = '0x' + this._infinitechain.signer.getAddress();
      nonce = this._web3.toHex(this._web3.eth.getTransactionCount(address, 'pending'));
    }

    let txParams = {
      data: txMethodData,
      from: from,
      to: to,
      value: value,
      nonce: nonce,
      gas: 4700000
    };

    let tx = new EthereumTx(txParams);
    let key = this._infinitechain.signer.getPrivateKey();
    tx.sign(Buffer.from(key, 'hex'));
    let serializedTx = '0x' + tx.serialize().toString('hex');
    return serializedTx;
  }

  _sendRawTransaction = (serializedTx) => {
    let txHash = this._web3.eth.sendRawTransaction(serializedTx);
    return txHash;
  }

  _sha3 = (content) => {
    return EthUtils.sha3(content).toString('hex');
  }
}

export default Contract;
