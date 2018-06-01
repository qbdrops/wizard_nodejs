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

  audit = async (stageHeight, receipts = null, balances = null, bond = null) => {
    let gringotts = this._infinitechain.gringotts;
    if (!receipts) {
      // Fetch receipts and accounts
      let resReceipts = await gringotts.getOffchainReceipts(stageHeight);
      receipts = resReceipts.data.receipts;
    }

    if (!balances) {
      let resBalance = await gringotts.getAccountBalances();
      balances = resBalance.data.balances;
    }

    // Sort the receipts by GSN
    receipts = receipts.sort(function (r1, r2) {
      return parseInt(r1.receiptData.GSN, 16) - parseInt(r2.receiptData.GSN, 16);
    }).map(receiptJson => new Receipt(receiptJson));

    // Group the sorted receipts by addresses
    let receiptsGroup = receipts.reduce((acc, receipt) => {
      let type = receipt.type();
      if (type == types.deposit) {
        let targetAddress = receipt.lightTxData.to;
        acc = this._pushOrNew(acc, targetAddress, receipt);
      } else if (type == types.withdrawal || type == types.instantWithdrawal) {
        let targetAddress = receipt.lightTxData.from;
        acc = this._pushOrNew(acc, targetAddress, receipt);
      } else {// remittance
        let targetFromAddress = receipt.lightTxData.from;
        let targetToAddress = receipt.lightTxData.to;
        acc = this._pushOrNew(acc, targetFromAddress, receipt);
        acc = this._pushOrNew(acc, targetToAddress, receipt);
      }
      return acc;
    }, {});

    let receiptsWithRepeatedGSN = this._repeatedGSNFilter(receipts);
    let receiptWithWrongBalance = this._wrongBalanceFilter(receiptsGroup, balances, bond);
    console.log(receiptsWithRepeatedGSN);
    console.log(receiptWithWrongBalance);

    return receiptsGroup;
  }

  _pushOrNew = (obj, key, value) => {
    if (obj[key]) {
      obj[key].push(value);
    } else {
      obj[key] = [value];
    }
    return obj;
  }

  _repeatedGSNFilter = (receipts) => {
    let counts = receipts.reduce((acc, receipt) => {
      let gsn = receipt.receiptData.GSN;
      acc = this._pushOrNew(acc, gsn, receipt);
      return acc;
    }, {});

    let repeatedGSN = Object.keys(counts).filter(gsn => counts[gsn].length > 1);
    let receiptsWithRepeatedGSN = repeatedGSN.map(gsn => counts[gsn]);
    return receiptsWithRepeatedGSN;
  }

  _wrongBalanceFilter = (receiptsGroup, balances, bond) => {
    bond = new BigNumber(bond, 16);
    let filterResult = Object.keys(receiptsGroup).reduce((acc, address) => { // each address check the balance by their own receipts
      let receipts = receiptsGroup[address];
      let initBalance = new BigNumber(balances[address], 16);

      let wrongBalanceResult = receipts.reduce((acc, receipt) => {
        let type = receipt.type();
        let value = new BigNumber(receipt.lightTxData.value, 16);
        if (type == types.deposit) {
          let expectedBalance = acc.balance.plus(value);
          let receiptBalance = new BigNumber(receipt.receiptData.toBalance, 16);
          let diff = expectedBalance.minus(receiptBalance).abs();

          if (diff == 0) {
            acc.balance = receiptBalance;
          } else {
            acc.wrongBalanceSum = acc.wrongBalanceSum.plus(diff);
            acc.wrongBalanceReceipts.push([acc.prevReceipt, receipt]);
          }
        } else if (type == types.withdrawal || type == types.instantWithdrawal) {
          let expectedBalance = acc.balance.minus(value);
          let receiptBalance = new BigNumber(receipt.receiptData.fromBalance, 16);
          let diff = expectedBalance.minus(receiptBalance).abs();

          if (diff == 0) {
            acc.balance = receiptBalance;
          } else {
            acc.wrongBalanceSum = acc.wrongBalanceSum.plus(diff);
            acc.wrongBalanceReceipts.push([acc.prevReceipt, receipt]);
          }
        } else {// remittance
          if (address == receipt.lightTxData.from) {
            let expectedBalance = acc.balance.minus(value);
            let receiptBalance = new BigNumber(receipt.receiptData.fromBalance, 16);
            let diff = expectedBalance.minus(receiptBalance).abs();

            if (diff == 0) {
              acc.balance = receiptBalance;
            } else {
              acc.wrongBalanceSum = acc.wrongBalanceSum.plus(diff);
              acc.wrongBalanceReceipts.push([acc.prevReceipt, receipt]);
            }
          } else {
            let expectedBalance = acc.balance.plus(value);
            let receiptBalance = new BigNumber(receipt.receiptData.toBalance, 16);
            let diff = expectedBalance.minus(receiptBalance).abs();

            if (diff == 0) {
              acc.balance = receiptBalance;
            } else {
              acc.wrongBalanceSum = acc.wrongBalanceSum.plus(diff);
              acc.wrongBalanceReceipts.push([acc.prevReceipt, receipt]);
            }
          }
        }
        acc.prevReceipt = receipt;
        return acc;
      }, {
        balance: initBalance,
        wrongBalanceReceipts: [],
        prevReceipt: null,
        wrongBalanceSum: new BigNumber(0)
      });
      wrongBalanceResult.wrongBalanceReceipts.forEach(receipts => {
        acc.wrongBalanceReceipts.push(receipts);
      });
      acc.wrongBalanceSum = acc.wrongBalanceSum.plus(wrongBalanceResult.wrongBalanceSum);
      return acc;
    }, {
      wrongBalanceReceipts: [],
      wrongBalanceSum: new BigNumber(0)
    });

    return filterResult.wrongBalanceSum.isGreaterThan(bond) ? {
      type2: filterResult.wrongBalanceReceipts
    } : {
      type3: filterResult.wrongBalanceReceipts
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
