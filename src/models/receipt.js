import EthUtils from 'ethereumjs-util';
import assert from 'assert';

const allowedLightTxKeys = ['lightTxHash', 'lightTxData', 'sig'];
const allowedSignatureKeys = ['clientLtxSignature', 'serverLtxSignature'];
const allowedReceiptDataKeys = ['GSN', 'lightTxHash', 'fromBalance', 'toBalance'];

class Receipt {
  constructor(lightTx, receiptData) {
    // Remove keys which are not in the whitelist
    Object.keys(lightTx).forEach(key => {
      if (!allowedLightTxKeys.includes(key)) {
        delete lightTx[key];
      }
    });
    Object.keys(lightTx.sig).forEach(key => {
      if (!allowedSignatureKeys.includes(key)) {
        delete lightTx.sig[key];
      }
    });
    Object.keys(receiptData).forEach(key => {
      if (!allowedReceiptDataKeys.includes(key)) {
        delete receiptData[key];
      }
    });
    // Check if all lightTxKeys, signature, receiptData are included
    // Meanwhile make an ordered lightTx, signature, receiptData
    let lightTxKeys = Object.keys(lightTx);
    let orderedLightTx = {};
    allowedLightTxKeys.forEach(key => {
      assert(lightTxKeys.includes(key), 'Parameter \'lightTx\' does not include key \'' + key + '\'.');
      orderedLightTx[key] = lightTx[key];
    });
    let signatureKeys = Object.keys(lightTx.sig);
    let orderedSignature = {};
    allowedSignatureKeys.forEach(key => {
      assert(signatureKeys.includes(key), 'Parameter \'sig\' does not include key \'' + key + '\'.');
      orderedSignature[key] = lightTx.sig[key];
    });
    let receiptKeys = Object.keys(receiptData);
    let orderedReceiptData = {};
    allowedReceiptDataKeys.forEach(key => {
      assert(receiptKeys.includes(key), 'Parameter \'receiptData\' does not include key \'' + key + '\'.');
      orderedReceiptData[key] = receiptData[key];
    });

    this.lightTxHash = orderedLightTx.lightTxHash;
    this.receiptHash = EthUtils.sha3(JSON.stringify(this.receiptData)).toString('hex');
    this.lightTxData = orderedLightTx.lightTxData;
    this.receiptData = orderedReceiptData;
    this.sig = orderedSignature;
    this.sig.serverReceiptSignature = {};
  }
}
export default Receipt;