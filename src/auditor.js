import BigNumber from 'bignumber.js';
import Receipt from './models/receipt';
import types from '@/models/types';
import EthUtils from 'ethereumjs-util';
import IndexedMerkleTree from '@/utils/indexed-merkle-tree';

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
      let resReceipts = await gringotts.getOffchainReceipts(stageHeight);
      receipts = resReceipts.data.receipts;
    }

    if (!balances) {
      let resBalance = await gringotts.getAccountBalances();
      balances = resBalance.data.balances;
    }

    if (!bond) {
      bond = (1000*1e18).toString(16);
    }

    // Reconstruct receiptTree from treeNodes
    let receiptTree = new IndexedMerkleTree(stageHeight, receipts.map(receipt => receipt.receiptHash));

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
      } else {
        let targetFromAddress = receipt.lightTxData.from;
        let targetToAddress = receipt.lightTxData.to;
        acc = this._pushOrNew(acc, targetFromAddress, receipt);
        acc = this._pushOrNew(acc, targetToAddress, receipt);
      }
      return acc;
    }, {});

    // let receiptsWithRepeatedGSN = this._repeatedGSNFilter(receipts);
    // let receiptsWithWrongBalance = this._wrongBalanceFilter(receiptsGroup, balances, bond);
    // let receiptsWithSkippedGSN = this._skippedGSNFilter(receipts);
    let receiptWithoutIntegrity = await this._integrityFilter(receipts, receiptTree);

    return {
      // receiptsWithRepeatedGSN: receiptsWithRepeatedGSN,
      // receiptsWithWrongBalance: receiptsWithWrongBalance,
      // receiptsWithSkippedGSN: receiptsWithSkippedGSN,
      receiptWithoutIntegrity: receiptWithoutIntegrity
    };
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

  _skippedGSNFilter = (receipts) => {
    let result = receipts.reduce((acc, receipt) => {
      if (acc.prevReceipt) {
        let prevGSN = new BigNumber(acc.prevReceipt.receiptData.GSN, 16);
        let GSN = new BigNumber(receipt.receiptData.GSN, 16);
        let diff = GSN.minus(prevGSN).abs();
        if (diff != 1) {
          acc.receiptsWithSkippedGSN.push([acc.prevReceipt, receipt]);
        }
      }
      acc.prevReceipt = receipt;
      return acc;
    }, { prevReceipt: null, receiptsWithSkippedGSN: [] });

    return result.receiptsWithSkippedGSN;
  }

  _wrongBalanceFilter = (receiptsGroup, balances) => {
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

          if (diff != 0) {
            acc.wrongBalanceSum = acc.wrongBalanceSum.plus(diff);
            acc.wrongBalanceReceipts.push([acc.prevReceipt, receipt]);
          }
          acc.balance = receiptBalance;
        } else if (type == types.withdrawal || type == types.instantWithdrawal) {
          let expectedBalance = acc.balance.minus(value);
          let receiptBalance = new BigNumber(receipt.receiptData.fromBalance, 16);
          let diff = expectedBalance.minus(receiptBalance).abs();

          if (diff != 0) {
            acc.wrongBalanceSum = acc.wrongBalanceSum.plus(diff);
            acc.wrongBalanceReceipts.push([acc.prevReceipt, receipt]);
          }
          acc.balance = receiptBalance;
        } else {// remittance
          if (address == receipt.lightTxData.from) {
            let expectedBalance = acc.balance.minus(value);
            let receiptBalance = new BigNumber(receipt.receiptData.fromBalance, 16);
            let diff = expectedBalance.minus(receiptBalance).abs();

            if (diff != 0) {
              acc.wrongBalanceSum = acc.wrongBalanceSum.plus(diff);
              acc.wrongBalanceReceipts.push([acc.prevReceipt, receipt]);
            }
            acc.balance = receiptBalance;
          } else {
            let expectedBalance = acc.balance.plus(value);
            let receiptBalance = new BigNumber(receipt.receiptData.toBalance, 16);
            let diff = expectedBalance.minus(receiptBalance).abs();

            if (diff != 0) {
              acc.wrongBalanceSum = acc.wrongBalanceSum.plus(diff);
              acc.wrongBalanceReceipts.push([acc.prevReceipt, receipt]);
            }
            acc.balance = receiptBalance;
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

    return filterResult.wrongBalanceReceipts;
  }

  _integrityFilter = async (receipts, tree) => {
    let contract = this._infinitechain.contract;

    // 1. Get receiptRootHash from blockchain
    let rootHashes = await contract.getStageRootHash(tree.stageHeight);
    let receiptRootHash = rootHashes[0];

    let result = receipts.reduce((acc, receipt) => {
      // 2. Get slice and compute root hash
      let slice = tree.getSlice(receipt.receiptHash);
      let receiptHashArray = tree.getAllLeafElements(receipt.receiptHash);
      let computedReceiptRootHash;
      if (receiptHashArray.includes(receipt.receiptHash)) {
        computedReceiptRootHash = '0x' + this._computeRootHashFromSlice(slice, tree.stageHeight);
        // 3. Compare
        if (computedReceiptRootHash != receiptRootHash) {
          acc.receiptsWithoutIntegirty.push(receipt);
        }
      } else {
        acc.receiptsWithoutIntegirty.push(receipt);
      }
      return acc;
    }, {
      receiptsWithoutIntegirty: []
    });

    return result.receiptsWithoutIntegirty;
  }

  _sha3 (content) {
    return EthUtils.sha3(content).toString('hex');
  }

  _computeRootHashFromSlice (slice, stageHeight) {
    let firstNode = slice.shift();

    let rootNode = slice.reduce((acc, curr) => {
      if (acc.treeNodeIndex % 2 == 0) {
        acc.treeNodeHash = this._sha3(acc.treeNodeHash.concat(curr.treeNodeHash));
      } else {
        acc.treeNodeHash = this._sha3(curr.treeNodeHash.concat(acc.treeNodeHash));
      }
      acc.treeNodeIndex = parseInt(acc.treeNodeIndex / 2);
      return acc;
    }, firstNode);

    return this._sha3(rootNode.treeNodeHash + stageHeight.toString(16).padStart(64, '0'));
  }
}

export default Auditor;
