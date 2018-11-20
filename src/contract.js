import Web3 from 'web3';
import Util from '@/utils/util';
import EthereumTx from 'ethereumjs-tx';
import Booster from '@/abi/Booster.json';
import EIP20 from '@/abi/EIP20.json';
import assert from 'assert';
import Receipt from '@/models/receipt';

class Contract {
  constructor (config, infinitechain) {
    this._infinitechain = infinitechain;
    this._web3Url = config.web3Url;
    this._boosterContractAddress = null;
    this._boosterAccountAddress = null;
    this._booster = null;
  }

  fetchBoosterAddress = async () => {
    let res = await this._infinitechain.gringotts.fetchBoosterAddress();
    this._boosterContractAddress = res.data.contractAddress;
    this._boosterAccountAddress = res.data.accountAddress;
    assert(this._boosterContractAddress, 'Can not fetch booster contract address.');
    assert(this._boosterAccountAddress, 'Can not fetch booster account address.');
  }

  fetchWebSocketConnection = async () => {
    this._web3 = new Web3(this._web3Url);
    this._booster = new this._web3.eth.Contract(Booster.abi, this._boosterContractAddress);
    return new Promise((resolve, reject) => {
      this._web3._provider.on('error', () => {
        reject('Websocket connect to ' + this._web3Url + ' fail.');
      });
      this._web3._provider.on('end', () => {
        reject('Websocket is not connected yet.');
      });
      this._web3._provider.on('connect', () => {
        resolve();
      });
    })
  }

  booster = () => {
    assert(this._booster, 'Infinitechain is not initialized yet');
    return this._booster;
  }

  web3 = () => {
    assert(this._web3, 'Infinitechain is not initialized yet');
    return this._web3;
  }

  erc20 = (address) => {
    assert(address.slice(0, 2) == '0x' && /^[0-9a-f]{40}$/i.test(address.substring(2)), 'ERC20 token address is invalid.');
    let erc20 = new (this.web3()).eth.Contract(EIP20.abi, address);
    return erc20;
  }

  proposeWithdrawal = async (receipt, privateKey = null) => {
    assert(receipt instanceof Receipt, 'Parameter \'lightTx\' should be instance of Receipt.');

    let txValue = '0x0';
    let clientAddress = '0x' + this._infinitechain.signer.getAddress(privateKey);
    let boosterContractAddress = this._boosterContractAddress;

    try {
      let receiptData = receipt.toArray();
      let txMethodData = this.booster().methods.proposeWithdrawal(
        receiptData
      ).encodeABI();
      let serializedTx = await this._signRawTransaction(txMethodData, clientAddress, boosterContractAddress, txValue, privateKey);
      let txHash = await this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      throw e;
    }
  }

  deposit = async (receipt, privateKey = null) => {
    assert(receipt instanceof Receipt, 'Parameter \'lightTx\' should be instance of Receipt.');

    let txValue = '0x0';
    let clientAddress = '0x' + this._infinitechain.signer.getAddress(privateKey);
    let boosterContractAddress = this._boosterContractAddress;

    try {
      let receiptData = receipt.toArray();
      let txMethodData = this.booster().methods.deposit(
        receiptData
      ).encodeABI();

      let serializedTx = await this._signRawTransaction(txMethodData, clientAddress, boosterContractAddress, txValue, privateKey);
      let txHash = await this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      throw e;
    }
  }

  proposeTokenDeposit = async (proposeData, privateKey = null) => {
    let txValue = '0x0';
    let clientAddress = '0x' + this._infinitechain.signer.getAddress(privateKey);
    let boosterContractAddress = this._boosterContractAddress;
    let depositAddress = Util.toByte32(proposeData.depositAddress);
    let depositValue = Util.toByte32(Util.toWei(proposeData.depositValue, 18));
    let depositAssetAddress = Util.toByte32(proposeData.depositAssetAddress);
    try {
      let txMethodData = this.booster().methods.proposeTokenDeposit(
        [
          '0x' + depositAddress,
          '0x' + depositValue,
          '0x' + depositAssetAddress
        ]
      ).encodeABI();

      let serializedTx = await this._signRawTransaction(txMethodData, clientAddress, boosterContractAddress, txValue, privateKey);
      let txHash = await this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      throw e;
    }
  }

  withdraw = async (receipt, privateKey = null) => {
    let txValue = '0x0';
    let clientAddress = '0x' + this._infinitechain.signer.getAddress(privateKey);
    let boosterContractAddress = this._boosterContractAddress;

    try {
      let txMethodData = this.booster().methods.withdraw(
        [
          '0x' + receipt.lightTxData.from,
          '0x' + receipt.lightTxData.nonce
        ]
      ).encodeABI();

      let serializedTx = await this._signRawTransaction(txMethodData, clientAddress, boosterContractAddress, txValue, privateKey);
      let txHash = await this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      throw e;
    }
  }

  instantWithdraw = async (receipt, privateKey = null) => {
    assert(receipt instanceof Receipt, 'Parameter \'receipt\' should be instance of Receipt.');

    let txValue = '0x0';
    let clientAddress = '0x' + this._infinitechain.signer.getAddress(privateKey);
    let boosterContractAddress = this._boosterContractAddress;

    try {
      let receiptData = receipt.toArray();
      let txMethodData = this.booster().methods.instantWithdraw(
        receiptData
      ).encodeABI();

      let serializedTx = await this._signRawTransaction(txMethodData, clientAddress, boosterContractAddress, txValue, privateKey);
      let txHash = await this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      throw e;
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
      throw e;
    }
  }
  
  challengedWrongBalance = async (receipt, receipt2) => {
    try {
      assert(receipt instanceof Receipt, 'Parameter \'receipt\' should be instance of Receipt.');
      assert(receipt2 instanceof Receipt, 'Parameter \'receipt2\' should be instance of Receipt.');

      let txMethodData = this.booster().methods.challengedWrongBalance(
        receipt.toArray(),
        receipt2.toArray()
      ).encodeABI();
      let serializedTx = await this._signRawTransaction(txMethodData);
      let txHash = await this._sendRawTransaction(serializedTx);
      return txHash;
    } catch (e) {
      throw e;
    }
  }

  compensate = async (stageHeight, lightTxHashes) => {
    try {
      let stageHash = '0x' + Util.sha3(stageHeight.toString());
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
      throw e;
    }
  }

  defend = async (stageHeight, lightTxHash, treeNodeIndex, slice, collidingLightTxHashes) => {
    try {
      let stageHash = '0x' + Util.sha3(stageHeight.toString());
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
      throw e;
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

  isTxFinished = async (txHash) => {
    let txReceipt = await this.web3().eth.getTransactionReceipt(txHash);
    return txReceipt.status == '0x1';
  }

  _signRawTransaction = async (txMethodData, from, to, value, privateKey = null, gas = 4700000, gasPrice = '0x2540be400') => {
    let address = '0x' + this._infinitechain.signer.getAddress(privateKey);
    let nonce = await this.web3().eth.getTransactionCount(address, 'pending');
    nonce = this.web3().utils.toHex(nonce);
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
    let key = this._infinitechain.signer.getPrivateKey(privateKey);
    tx.sign(Buffer.from(key, 'hex'));
    let serializedTx = '0x' + tx.serialize().toString('hex');
    return serializedTx;
  }

  _sendRawTransaction = async (serializedTx) => {
    let receipt = await this._web3.eth.sendSignedTransaction(serializedTx);
    return receipt.transactionHash;
  }
}

export default Contract;
