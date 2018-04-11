import EthUtils from 'ethereumjs-util';
import assert from 'assert';
import lightTransaction from '@/models/light-transaction';

const allowedLightTxKeys = ['lightTxHash', 'lightTxData', 'sig'];
const allowedSignatureKeys = ['clientLtxSignature', 'serverLtxSignature'];
const allowedReceiptDataKeys = ['GSN', 'lightTxHash', 'fromBalance', 'toBalance'];

class Receipt {
  constructor(lightTx, receiptData) {
    // Remove keys which are not in the whitelist
    assert(lightTx instanceof lightTransaction, 'Parameter \'lightTx\' is not a lightTransaction instance.');
    Object.keys(receiptData).forEach(key => {
      if (!allowedReceiptDataKeys.includes(key)) {
        delete receiptData[key];
      }
    });
    // Meanwhile make an ordered receiptData
    let receiptKeys = Object.keys(receiptData);
    let orderedReceiptData = {};
    allowedReceiptDataKeys.forEach(key => {
      assert(receiptKeys.includes(key), 'Parameter \'receiptData\' does not include key \'' + key + '\'.');
      orderedReceiptData[key] = receiptData[key];
    });

    this.lightTxHash = lightTx.lightTxHash;
    this.receiptHash = EthUtils.sha3(JSON.stringify(this.receiptData)).toString('hex');
    this.lightTxData = lightTx.lightTxData;
    this.receiptData = orderedReceiptData;
    this.sig = lightTx.sig;
    this.sig.serverReceiptSignature = {};
  }
}
export default Receipt;