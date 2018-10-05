import EthUtils from 'ethereumjs-util';
import assert from 'assert';
import LightTransaction from '@/models/light-transaction';
import types from '@/models/types';

const allowedReceiptJsonKeys = ['lightTxHash', 'lightTxData', 'sig', 'receiptData', 'metadata'];
const allowedReceiptDataKeys = ['stageHeight', 'GSN', 'preGSN', 'lightTxHash', 'fromBalance', 'toBalance', 'serverMetadataHash'];
const instantWithdrawalLimit = 10;

class Receipt {
  constructor (receiptJson) {
    // Remove keys which are not in the whitelist
    Object.keys(receiptJson).forEach(key => {
      if (!allowedReceiptJsonKeys.includes(key)) {
        delete receiptJson[key];
      }
    });

    Object.keys(receiptJson.receiptData).forEach(key => {
      if (!allowedReceiptDataKeys.includes(key)) {
        delete receiptJson.receiptData[key];
      }
    });

    // Check Json format (except for 'metadata')
    allowedReceiptJsonKeys.filter(key => key != 'metadata').forEach(key => {
      assert(Object.keys(receiptJson).includes(key), 'Parameter \'receiptJson\' does not include key \'' + key + '\'.');
    });

    // Check lightTxData format
    let lightTx = new LightTransaction({
      lightTxData: receiptJson.lightTxData,
      metadata: receiptJson.metadata,
      sig: receiptJson.sig
    });
    assert(lightTx.hasClientLightTxSig(), '\'clientLightTx\' signature is empty.');
    assert(lightTx.hasServerLightTxSig(), '\'serverLightTx\' signature is empty.');

    // Meanwhile make an ordered receiptData
    let receiptKeys = Object.keys(receiptJson.receiptData);
    let orderedReceiptData = {};
    allowedReceiptDataKeys.forEach(key => {
      if (key != 'serverMetadataHash') {
        assert(receiptKeys.includes(key), 'Parameter \'receiptData\' does not include key \'' + key + '\'.');
      }
      orderedReceiptData[key] = receiptJson.receiptData[key];
    });
    assert(lightTx.lightTxHash === receiptJson.receiptData.lightTxHash, 'The \'lightTxHash\' is different in receiptData and lightTransaction.');

    this.lightTxHash = lightTx.lightTxHash;
    this.lightTxData = lightTx.lightTxData;
    this.receiptData = this._normalize(orderedReceiptData);
    this.metadata = (receiptJson.metadata);
    this.receiptData.serverMetadataHash = this._sha3(this.metadata.server);
    this.receiptHash = this._sha3(Object.values(this.receiptData).reduce((acc, curr) => acc + curr, ''));
    this.sig = receiptJson.sig;
    // Initialize boosterReceipt sig if it is undefined.
    if (!this.sig.boosterReceipt || !this.hasBoosterReceiptSig()) {
      this.sig.boosterReceipt = {};
    }
  }

  _normalize = (receiptData) => {
    receiptData.stageHeight = receiptData.stageHeight.toString(16).padStart(64, '0').slice(-64);
    receiptData.GSN         = receiptData.GSN.toString(16).padStart(64, '0').slice(-64);
    receiptData.preGSN      = receiptData.preGSN.toString(16).padStart(64, '0').slice(-64);
    receiptData.fromBalance = receiptData.fromBalance.toString(16).padStart(64, '0').slice(-64);
    receiptData.toBalance   = receiptData.toBalance.toString(16).padStart(64, '0').slice(-64);
    return receiptData;
  }

  type = () => {
    let res;
    let from = this.lightTxData.from;
    let to = this.lightTxData.to;
    let value = parseInt(this.lightTxData.value, 16) / 1e18;

    if (from == 0 || to == 0) {
      if (from == 0) {
        res = types.deposit;
      } else {
        res = (value > instantWithdrawalLimit) ? types.withdrawal : types.instantWithdrawal;
      }
    } else {
      res = types.remittance;
    }

    return res;
  }

  hasClientLightTxSig = () => {
    return (Object.keys(this.sig.clientLightTx).sort().toString() == 'r,s,v');
  }

  hasServerLightTxSig = () => {
    return (Object.keys(this.sig.serverLightTx).sort().toString() == 'r,s,v');
  }

  hasBoosterReceiptSig = () => {
    return (Object.keys(this.sig.boosterReceipt).sort().toString() == 'r,s,v');
  }

  toJson = () => {
    let json = {
      lightTxHash: this.lightTxHash,
      lightTxData: this.lightTxData,
      receiptHash: this.receiptHash,
      receiptData: this.receiptData,
      sig: this.sig,
      metadata: this.metadata
    };
    return json;
  }

  _sha3 (content) {
    return EthUtils.sha3(content).toString('hex');
  }
}

export default Receipt;
