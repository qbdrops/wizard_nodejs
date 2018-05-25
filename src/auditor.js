import BigNumber from 'bignumber.js';
import Receipt from './models/receipt';
import types from '@/models/types';
import EthUtils from 'ethereumjs-util';

class Auditor {
  constructor (auditorConfig, infinitechain) {
    this._infinitechain = infinitechain;
    this.serverAddress = auditorConfig.serverAddress;
    this._storage = auditorConfig.storage;
    this._nodeUrl = auditorConfig.nodeUrl;
  }

  audit = async (stageReceipts, accounts) => { // previous stage accounts
    let objectedReceipts = [];
    let existGSN = {};// type1 use
    let bond = 1000000;// fetch bond by sidechain contract
    bond = new BigNumber(bond);
    // Arrange the receipts by GSN
    let orderedReceipts = stageReceipts.sort(function (a, b) {
      return parseInt('0x' + a.receiptData.GSN) - parseInt('0x' + b.receiptData.GSN);
    });

    orderedReceipts.forEach(receipt => {
      // verify signature
      let result = this._verifySignature(receipt);
      if (!result) {
        objectedReceipts.push({
          wrongSignature: receipt
        });
      }
      // type1 double GSN
      let type1Result = this._type1Filter(receipt, existGSN);
      if (!type1Result.isOK) {
        objectedReceipts.push({
          type1Receipt: type1Result.wrongReceipts
        });
      }
      existGSN = type1Result.existGSN;
      // type2 and type3 incorrect balance
      let type2And3Result = this._type2And3Filter(receipt, accounts);
      if (!type2And3Result.isOK) {
        if (type2And3Result.value > bond) {
          // wrong receipt value is larger than bond
          objectedReceipts.push({
            type2Receipt: receipt
          });
        } else {
          // wrong receipt value is less than bond
          objectedReceipts.push({
            type3Receipt: receipt
          });
        }
      }
      // type4 continual GSN
      let type4Result = this._type4Filter(receipt, orderedReceipts);
      if (!type4Result.isOK) {
        objectedReceipts.push({
          type3Receipt: type4Result.wrongReceipts
        });
      }
      // type5 data correct
      let type5Result = this._type5Filter(receipt);
      if (!type5Result) {
        objectedReceipts.push({
          type5Receipt: receipt
        });
      }
    });
    return objectedReceipts;
  }

  _verifySignature = (receiptJson) => {
    let verifier = this._infinitechain.verifier;
    let receipt = new Receipt(receiptJson);
    let type = receipt.type();
    let from = receiptJson.lightTxData.from;
    let to = receiptJson.lightTxData.to;
    receiptJson.sig.clientLightTx.v = parseInt(receiptJson.sig.clientLightTx.v);
    let recoverClientAddress = verifier._recover(receiptJson.lightTxHash, receiptJson.sig.clientLightTx).toString('hex').padStart(64, '0');
    if (type == types.deposit) {
      if (recoverClientAddress == to) {
        return false;
      }
    } else if (type == types.withdrawal || type == types.instantWithdrawal || type == types.remittance) {
      if (recoverClientAddress == from) {
        return false;
      }
    }

    receiptJson.sig.serverLightTx.v = parseInt(receiptJson.sig.serverLightTx.v);
    let recoverServerLightTxAddress = verifier._recover(receiptJson.lightTxHash, receiptJson.sig.serverLightTx).toString('hex').padStart(64, '0');
    if (recoverServerLightTxAddress != this.serverAddress) {
      return false;
    }
    receiptJson.sig.serverReceipt.v = parseInt(receiptJson.sig.serverReceipt.v);
    let recoverServerReceiptAddress = verifier._recover(receiptJson.receiptHash, receiptJson.sig.serverReceipt).toString('hex').padStart(64, '0');
    if (recoverServerReceiptAddress != this.serverAddress) {
      return false;
    }
  }

  _type1Filter = (receiptJson, existGSN) => {
    let gsn = receiptJson.receiptData.GSN;
    let wrongReceipts;
    let result = true;
    if (!Object.keys(existGSN).includes(gsn)) {
      existGSN.gsn = receiptJson;
    } else {
      let receipt1 = existGSN.gsn;
      wrongReceipts = {
        receipt1: receipt1,
        receipt2: receiptJson
      };
      result = false;
    }
    return {
      isOK: result,
      existGSN: existGSN,
      wrongReceipts: wrongReceipts
    };
  }

  _type2And3Filter = (receiptJson, accounts) => {
    let initBalance = '0000000000000000000000000000000000000000000000000000000000000000';
    let fromBalance = initBalance;
    let toBalance = initBalance;
    let result = true;
    let value;
    let receipt = new Receipt(receiptJson);
    let type = receipt.type();
    if (type == types.deposit) {
      let value = new BigNumber('0x' + receipt.lightTxData.value);
      toBalance = accounts[receipt.lightTxdata.from].balance;
      toBalance = new BigNumber('0x' + toBalance);
      toBalance = toBalance.plus(value);
      toBalance = toBalance.toString(16).padStart(64, '0');
      accounts[receipt.lightTxData.from].balance = toBalance;
    } else if (type == types.withdrawal || type == types.instantWithdrawal) { // withdraw receipt
      value = new BigNumber('0x' + receipt.lightTxData.value);
      fromBalance = accounts[receipt.lightTxData.to].balance;
      fromBalance = new BigNumber('0x' + fromBalance);
      if (fromBalance.isGreaterThanOrEqualTo(value)) {
        fromBalance = fromBalance.minus(value);
        fromBalance = fromBalance.toString(16).padStart(64, '0');
        accounts[receipt.lightTxData.to].balance = fromBalance;
      } else {
        // Insufficient balance
        result = false;
      }
    } else { // remittance receipt
      value = new BigNumber('0x' + receipt.lightTxData.value);
      fromBalance = accounts[receipt.lightTxData.from].balance;
      toBalance = accounts[receipt.lightTxData.to].balance;
      fromBalance = new BigNumber('0x' + fromBalance);
      toBalance = new BigNumber('0x' + toBalance);
      if (fromBalance.isGreaterThanOrEqualTo(value)) {
        fromBalance = fromBalance.minus(value);
        toBalance = toBalance.plus(value);
        fromBalance = fromBalance.toString(16).padStart(64, '0');
        toBalance = toBalance.toString(16).padStart(64, '0');
        accounts[receipt.lightTxdata.from].balance = fromBalance;
        accounts[receipt.lightTxdata.to].balance = toBalance;
      } else {
        // Insufficient balance
        result = false;
      }
    }
    return {
      isOK: result,
      value: value
    };
  }

  _type4Filter = (receiptJson, orderedReceipts) => {
    let wrongReceipts;
    let result = true;
    let currentGSN = parseInt('0x' + receiptJson.receiptData.GSN);
    let previousGSN = parseInt('0x' + orderedReceipts[currentGSN - 2].receiptData.GSN);
    let gsnResult = previousGSN - currentGSN;
    if (orderedReceipts[currentGSN - 2] != undefined) {// avoid the first receipt error
      if (gsnResult != 1) {
        wrongReceipts = {
          receipt1: receiptJson,
          receipt2: orderedReceipts[currentGSN - 2]
        };
        result = false;
      }
    }
    return {
      isOK: result,
      wrongReceipts: wrongReceipts
    };
  }

  _type5Filter = (receiptJson) => {
    let computedLightTxHash = this._sha3(Object.values(receiptJson.lightTxData).reduce((acc, curr) => acc + curr, ''));
    let computedReceiptHash = this._sha3(Object.values(receiptJson.receiptData).reduce((acc, curr) => acc + curr, ''));
    if (receiptJson.lightTxHash != computedLightTxHash) {
      return false;
    }
    if (receiptJson.receiptHash != computedReceiptHash) {
      return false;
    }
  }

  _sha3 (content) {
    return EthUtils.sha3(content).toString('hex');
  }
}

export default Auditor;
