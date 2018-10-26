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
    this._boosterContractAddress = null;
    this.boosterAccountAddress = null;
    this._booster = null;
  }

  fetchBooster = async () => {
    let boosterContractAddress = null;
    let boosterAccountAddress = null;
    try {
      let res = await this._infinitechain.gringotts.fetchBoosterAddress();
      boosterContractAddress = res.data.contractAddress;
      boosterAccountAddress = res.data.accountAddress;
    } catch (e) {
      console.error(e);
    }

    assert(boosterContractAddress, 'Can not fetch booster contract address.');
    assert(boosterAccountAddress, 'Can not fetch booster account address.');
    this._boosterContractAddress = boosterContractAddress;
    this.boosterAccountAddress = boosterAccountAddress;
    this._web3 = new Web3(this._web3Url);
    this._booster = new this._web3.eth.Contract(Booster.abi, boosterContractAddress);
  }

  booster = () => {
    assert(this._booster, 'Infinitechain is not initialized yet');
    return this._booster;
  }

  web3 = () => {
    assert(this._web3, 'Infinitechain is not initialized yet');
    return this._web3;
  }

  proposeWithdrawal = async (receipt, nonce = null) => {
    assert(receipt instanceof Receipt, 'Parameter \'lightTx\' should be instance of Receipt.');

    let txValue = '0x0';
    let clientAddress = '0x' + this._infinitechain.signer.getAddress();
    let boosterContractAddress = this._boosterContractAddress;

    try {
      let receiptData = receipt.toArray();
      let txMethodData = this.booster().methods.proposeWithdrawal(
        receiptData
      ).encodeABI();
      let serializedTx = await this._signRawTransaction(txMethodData, clientAddress, boosterContractAddress, txValue, nonce);
      let txHash = await this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      console.error(e);
    }
  }

  deposit = async (receipt, nonce = null) => {
    assert(receipt instanceof Receipt, 'Parameter \'lightTx\' should be instance of Receipt.');

    let txValue = '0x0';
    let clientAddress = '0x' + this._infinitechain.signer.getAddress();
    let boosterContractAddress = this._boosterContractAddress;

    try {
      let receiptData = receipt.toArray();
      let txMethodData = this.booster().methods.deposit(
        receiptData
      ).encodeABI();

      let serializedTx = await this._signRawTransaction(txMethodData, clientAddress, boosterContractAddress, txValue, nonce);
      let txHash = await this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      console.error(e);
    }
  }

  proposeTokenDeposit = async (proposeData, nonce = null) => {
    let txValue = '0x0';
    let clientAddress = '0x' + this._infinitechain.signer.getAddress();
    let boosterContractAddress = this._boosterContractAddress;
    let depositAddress = proposeData.depositAddress.slice(-40).padStart(64, '0').slice(-64);
    let depositValue = this._to32BytesHex(proposeData.depositValue, false);
    let depositAssetAddress = proposeData.depositAssetAddress.toString(16).padStart(64, '0').slice(-64);
    try {
      let txMethodData = this.booster().methods.proposeTokenDeposit(
        [
          '0x' + depositAddress,
          '0x' + depositValue,
          '0x' + depositAssetAddress
        ]
      ).encodeABI();

      let serializedTx = await this._signRawTransaction(txMethodData, clientAddress, boosterContractAddress, txValue, nonce);
      let txHash = await this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      console.error(e);
    }
  }

  withdraw = async (receipt, nonce = null) => {
    let txValue = '0x0';
    let clientAddress = '0x' + this._infinitechain.signer.getAddress();
    let boosterContractAddress = this._boosterContractAddress;

    try {
      let txMethodData = this.booster().methods.withdraw(
        [
          '0x' + receipt.lightTxData.from,
          '0x' + receipt.lightTxData.nonce
        ]
      ).encodeABI();

      let serializedTx = await this._signRawTransaction(txMethodData, clientAddress, boosterContractAddress, txValue, nonce);
      let txHash = await this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      console.error(e);
    }
  }

  instantWithdraw = async (receipt, nonce = null) => {
    assert(receipt instanceof Receipt, 'Parameter \'lightTx\' should be instance of Receipt.');

    let txValue = '0x0';
    let clientAddress = '0x' + this._infinitechain.signer.getAddress();
    let boosterContractAddress = this._boosterContractAddress;

    try {
      let receiptData = receipt.toArray();
      let txMethodData = this.booster().methods.instantWithdraw(
        receiptData
      ).encodeABI();

      let serializedTx = await this._signRawTransaction(txMethodData, clientAddress, boosterContractAddress, txValue, nonce);
      let txHash = await this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      console.error(e);
    }
  }

  challenge = async (payment) => {
    try {
      let stageHash = '0x' + payment.stageHash;
      let lightTxHash = '0x' + payment.lightTxHash;
      let txMethodData = this.booster().methods.takeObjection(
        [stageHash, lightTxHash],
        payment.v,
        payment.r,
        payment.s
      ).encodeABI();
      let serializedTx = await this._signRawTransaction(txMethodData);
      let txHash = await this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      console.error(e);
    }
  }

  compensate = async (stageHeight, lightTxHashes) => {
    try {
      let stageHash = '0x' + this._sha3(stageHeight.toString());
      lightTxHashes = lightTxHashes.map(lightTxHash => '0x' + lightTxHash);
      let txMethodData = this.booster().methods.payPenalty(
        stageHash,
        lightTxHashes,
        '' // Work around! To prevent solidity invalid argument error.
      ).encodeABI();
      let serializedTx = await this._signRawTransaction(txMethodData);
      let txHash = await this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      console.error(e);
    }
  }

  defend = async (stageHeight, lightTxHash, treeNodeIndex, slice, collidingLightTxHashes) => {
    try {
      let stageHash = '0x' + this._sha3(stageHeight.toString());
      lightTxHash = '0x' + lightTxHash;
      slice = slice.map(h => '0x' + h);
      collidingLightTxHashes = collidingLightTxHashes.map(h => '0x' + h);
      let txMethodData = this.booster().methods.exonerate(
        stageHash,
        lightTxHash,
        treeNodeIndex,
        slice,
        collidingLightTxHashes
      ).encodeABI();

      let serializedTx = await this._signRawTransaction(txMethodData);
      let txHash = await this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      console.error(e);
    }
  }

  getStageRootHash = async (stageHeight) => {
    let rootHashes = await this.booster().methods.stages(stageHeight).call();
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

  _signRawTransaction = async (txMethodData, from, to, value, nonce = null, gas = 4700000, gasPrice = '0x2540be400') => {
    if (nonce == null) {
      let address = '0x' + this._infinitechain.signer.getAddress();
      nonce = await this.web3().eth.getTransactionCount(address, 'pending');
      nonce = this.web3().utils.toHex(nonce);
    }
    let txParams = {
      data: txMethodData,
      from: from,
      to: to,
      value: value,
      nonce: nonce,
      gas: gas,
      gasPrice: gasPrice
    };

    let tx = new EthereumTx(txParams);
    let key = this._infinitechain.signer.getPrivateKey();
    tx.sign(Buffer.from(key, 'hex'));
    let serializedTx = '0x' + tx.serialize().toString('hex');
    return serializedTx;
  }

  _sendRawTransaction = async (serializedTx) => {
    let receipt = await this._web3.eth.sendSignedTransaction(serializedTx);
    return receipt.transactionHash;
  }

  _sha3 = (content) => {
    return EthUtils.sha3(content).toString('hex');
  }

  _to32BytesHex = (n, toWei) => {
    let startWith0x = ((n.toString().slice(0, 2) == '0x') && (n.toString().substring(2).length == 64));
    let lengthIs64Bytes = (n.toString().length == 64);

    if (startWith0x || lengthIs64Bytes) {
      n = n.slice(-64).toLowerCase();
    } else {
      let m = parseFloat(n);
      m = toWei ? (m * 1e18) : m;
      m = Math.floor(m);
      let h = m.toString(16);
      assert(h != 'NaN', '\'' + n + '\' can not be parsed to an integer.');
      n = h.padStart(64, '0').toLowerCase();
    }
    return n;
  }
}

export default Contract;
