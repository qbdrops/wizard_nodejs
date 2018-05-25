import BigNumber from 'bignumber.js';

class Auditor {
  constructor (auditorConfig, infinitechain) {
    this._infinitechain = infinitechain;
    this.serverAddress = auditorConfig.serverAddress;
    this._storage = auditorConfig.storage;
    this._nodeUrl = auditorConfig.nodeUrl;
  }

  filterWrongReceipts = async (stageReceipts, accounts) => { // previous stage accounts
    let wrongSignature = [];
    let type1 = [];
    let type2 = [];
    let type3 = [];
    let type4 = [];
    let type5 = [];
    let existGSN = {};// type1 use
    let gsnCounter = 1;// type4 use
    let bond = 1000000;// fetch bond by sidechain contract

    // Arrange the receipts by GSN
    let orderReceipts = stageReceipts.map(receipt => {
      orderReceipts[receipt.receiptData.GSN] = receipt;
    });

    orderReceipts.map(receipt => {
      // verify signature
      this._verifySignatyure(receipt, wrongSignature);
      // type1 double GSN
      this._type1Filter(receipt, existGSN, type1);
      // type2 incorrect balance (bigger than bond)
      // type3 incorrect balance (less than bond)
      this._type2And3Filter(receipt, accounts, bond, type2, type3);
      // type4 continual GSN
      this._type4Filter(receipt, gsnCounter, orderReceipts, type4);
      // type5 data correct
      this._type5Filter(receipt, type5);
    });

    return {
      wrongSignature: wrongSignature,
      type1: type1,
      type2: type2,
      type3: type3,
      type4: type4,
      type5: type5
    };
  }

  _verifySignatyure = (receipt, wrongSignature) => {
    receipt.sig.clientLightTx.v = parseInt(receipt.sig.clientLightTx.v);
    let recoverClientAddress = this._infinitechain.verifier._recover(receipt.lightTxHash, receipt.sig.clientLightTx);
    if (recoverClientAddress != receipt.lightTxData.from || recoverClientAddress != receipt.lightTxData.to) {
      wrongSignature.push({
        wrongClientLightTxSig: receipt
      });
    }
    receipt.sig.serverLightTx.v = parseInt(receipt.sig.serverLightTx.v);
    let recoverServerLightTxAddress = this._infinitechain.verifier._recover(receipt.lightTxHash, receipt.sig.serverLightTx);
    if (recoverServerLightTxAddress != this.serverAddress) {
      wrongSignature.push({
        wrongServerLightTxSig: receipt
      });
    }
    receipt.sig.serverReceipt.v = parseInt(receipt.sig.serverReceipt.v);
    let recoverServerReceiptAddress = this._infinitechain.verifier._recover(receipt.receiptHash, receipt.sig.serverReceipt);
    if (recoverServerReceiptAddress != this.serverAddress) {
      wrongSignature.push({
        wrongServerReceiptSig: receipt
      });
    }
  }

  _type1Filter = (receipt, existGSN, type1) => {
    let gsn = receipt.receiptData.GSN;
    if (!Object.keys(existGSN).includes(gsn)) {
      existGSN.gsn = receipt;
    } else {
      let receipt1 = existGSN.gsn;
      let wrongReceipts = {
        receipt1: receipt1,
        receipt2: receipt
      };
      type1.push(wrongReceipts);
    }
  }

  _type2And3Filter = (receipt, accounts, bond, type2, type3) => {
    let initBalance = '0000000000000000000000000000000000000000000000000000000000000000';
    let fromBalance = initBalance;
    let toBalance = initBalance;
    if (receipt.lightTxData.to === null) { // deposit receipt
      let value = new BigNumber('0x' + receipt.lightTxData.value);
      toBalance = accounts[receipt.lightTxdata.from].balance;
      toBalance = new BigNumber('0x' + toBalance);
      toBalance = toBalance.plus(value);
      toBalance = toBalance.toString(16).padStart(64, '0');
      accounts[receipt.lightTxdata.from].balance = toBalance;
    } else if (receipt.lightTxData.from === null) { // withdraw receipt
      let value = new BigNumber('0x' + receipt.lightTxData.value);
      fromBalance = accounts[receipt.lightTxdata.to].balance;
      fromBalance = new BigNumber('0x' + fromBalance);
      if (fromBalance.isGreaterThanOrEqualTo(value)) {
        fromBalance = fromBalance.minus(value);
        fromBalance = fromBalance.toString(16).padStart(64, '0');
        accounts[receipt.lightTxdata.to].balance = fromBalance;
      } else {
        // Insufficient balance
        let limit = bond.padStart(64, '0').slice(-64);
        limit = new BigNumber('0x' + limit);
        if (value > limit) { // wrong receipt value is larger than bond
          type2.push(receipt);
        } else { // wrong receipt value is less than bond
          type3.push(receipt);
        }
      }
    } else if (receipt.lightTxData.from && receipt.lightTxData.to) { // remittance receipt
      let value = new BigNumber('0x' + receipt.lightTxData.value);
      fromBalance = accounts[receipt.lightTxdata.from].balance;
      toBalance = accounts[receipt.lightTxdata.to].balance;
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
        type2.push(receipt); // Insufficient balance
      }
    }
  }

  _type4Filter = (receipt, gsnCounter, orderReceipts, type4) => {
    if (receipt.receiptData.GSN != gsnCounter) {
      if (orderReceipts[gsnCounter - 2] === undefined || orderReceipts[gsnCounter] === undefined) {
        if (orderReceipts[gsnCounter - 2] === undefined) {
          let wrongReceipts = {
            receipt: orderReceipts[gsnCounter]
          };
          type4.push(wrongReceipts);
        }
        if (orderReceipts[gsnCounter] === undefined) {
          let wrongReceipts = {
            receipt: orderReceipts[gsnCounter - 2]
          };
          type4.push(wrongReceipts);
        }
      } else {
        let wrongReceipts = {
          receipt1: orderReceipts[gsnCounter - 2],
          receipt2: orderReceipts[gsnCounter]
        };
        type4.push(wrongReceipts);
      }
    }
    gsnCounter++;
  }

  _type5Filter = (receipt, type5) => {
    let computedLightTxHash = this._sha3(Object.values(receipt.lightTxData).reduce((acc, curr) => acc + curr, ''));
    let computedReceiptHash = this._sha3(Object.values(receipt.receiptData).reduce((acc, curr) => acc + curr, ''));
    if (receipt.lightTxHash != computedLightTxHash) {
      type5.push(receipt);
    }
    if (receipt.receiptHash != computedReceiptHash) {
      type5.push(receipt);
    }
  }
}

export default Auditor;