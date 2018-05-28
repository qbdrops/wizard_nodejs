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
    let bond = 1000000;// fetch bond by sidechain contract
    bond = new BigNumber(bond);

    // Arrange the receipts by GSN
    let orderedReceipts = stageReceipts.sort(function (r1, r2) {
      return parseInt(r1.receiptData.GSN, 16) - parseInt(r2.receiptData.GSN, 16);
    });

    let challengedReceipts = orderedReceipts.reduce((acc, curr) => {
      // recover receipt object
      let receipt = new Receipt(curr);

      // type1 double GSN
      let type1Result = this._type1Filter(receipt, acc.existedGSN);
      if (!type1Result.ok) {
        acc.challengedReceipts.type1.push(type1Result.wrongReceipts);
      }
      acc.existedGSN = type1Result.existedGSN;
      // type2 and type3 incorrect balance
      let type2And3Result = this._type2And3Filter(receipt, accounts);
      if (!type2And3Result.ok) {
        if (type2And3Result.value > bond) {
          // wrong receipt value is larger than bond
          acc.challengedReceipts.type2.push(receipt.toJson());
        } else {
          // wrong receipt value is less than bond
          acc.challengedReceipts.type3.push(receipt.toJson());
        }
      }
      // type4 continual GSN
      let type4Result = this._type4Filter(receipt, orderedReceipts);
      if (!type4Result.ok) {
        acc.challengedReceipts.type4.push(type4Result.wrongReceipts);
      }
      // type5 data correct
      let type5Result = this._type5Filter(receipt);
      if (!type5Result) {
        acc.challengedReceipts.type5.push(receipt.toJson());
      }
    }, {
      challengedReceipts: {
        type1: [],
        type2: [],
        type3: [],
        type4: [],
        type5: []
      },
      existedGSN: []
    });
    return challengedReceipts;
  }

  _type1Filter = (receipt, existedGSN) => {
    let gsn = receipt.receiptData.GSN;
    let wrongReceipts;
    let result = true;
    if (!Object.keys(existedGSN).includes(gsn)) {
      existedGSN.gsn = receipt.toJson();
    } else {
      let receipt1 = existedGSN.gsn;
      wrongReceipts = {
        receipt1: receipt1,
        receipt2: receipt.toJson
      };
      result = false;
    }
    return {
      ok: result,
      existedGSN: existedGSN,
      wrongReceipts: wrongReceipts
    };
  }

  _type2And3Filter = (receipt, accounts) => {
    let initBalance = '0000000000000000000000000000000000000000000000000000000000000000';
    let fromBalance = initBalance;
    let toBalance = initBalance;
    let result = true;
    let value;
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
      ok: result,
      value: value
    };
  }

  _type4Filter = (receipt, orderedReceipts) => {
    let wrongReceipts;
    let result = true;
    let currentGSN = parseInt(receipt.receiptData.GSN, 16);
    let previousGSN = parseInt(orderedReceipts[currentGSN - 2].receiptData.GSN, 16);
    let gsnResult = previousGSN - currentGSN;
    if (orderedReceipts[currentGSN - 2] != undefined) {// avoid the first receipt error
      if (gsnResult != 1) {
        wrongReceipts = {
          receipt1: receipt.toJson(),
          receipt2: orderedReceipts[currentGSN - 2]
        };
        result = false;
      }
    }
    return {
      ok: result,
      wrongReceipts: wrongReceipts
    };
  }

  _type5Filter = (receipt) => {
    let computedLightTxHash = this._sha3(Object.values(receipt.lightTxData).reduce((acc, curr) => acc + curr, ''));
    let computedReceiptHash = this._sha3(Object.values(receipt.receiptData).reduce((acc, curr) => acc + curr, ''));
    if (receipt.lightTxHash != computedLightTxHash) {
      return false;
    }
    if (receipt.receiptHash != computedReceiptHash) {
      return false;
    }
  }

  _sha3 (content) {
    return EthUtils.sha3(content).toString('hex');
  }
}

export default Auditor;
