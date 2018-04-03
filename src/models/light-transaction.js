import EthUtils from 'ethereumjs-util';
import assert from 'assert';

const allowedLightTxDataKeys = ['type', 'from', 'to', 'value', 'fee', 'LSN', 'stageHeight'];
const allowedLightTxTypes = ['deposit', 'withdrawal', 'instantWithdraw', 'remittance'];

class lightTransaction {
  constructor (lightTxData, crypto) {
    this._crypto = crypto;

    // Remove keys which are not in the whitelist
    Object.keys(lightTxData).forEach(key => {
      if (!allowedLightTxDataKeys.includes(key)) {
        delete lightTxData[key];
      }
    });

    // Check if all lightTxDataKeys are included
    // Meanwhile make an ordered lightTxData
    let keys = Object.keys(lightTxData);
    let orderedLightTxData = {};
    allowedLightTxDataKeys.forEach(key => {
      assert(keys.includes(key), 'Parameter \'lightTxData\' does not include key \'' + key + '\'.');
      orderedLightTxData[key] = lightTxData[key];
    });

    // Check lightTxData data format
    // Check lightTx type
    assert(allowedLightTxTypes.includes(lightTxData.type), 'Parameter \'lightTxData\' does have correct \'type\'.');


    this.lightTxData = orderedLightTxData;
    this.lightTxHash = EthUtils.sha3(JSON.stringify(this.lightTxData)).toString('hex');

    this.sig = {};
    // lightTx will always be initialized by client
    this.signWithClientKey();
  }

  signWithClientKey () {
    this.sig.clientLightTxHash = this._sign();
  }

  signWithServerKey () {
    this.sig.serverLightTxHash = this._sign();
  }

  _sign () {
    let prefix = new Buffer('\x19Ethereum Signed Message:\n');
    let ethMsgHash = EthUtils.sha3(Buffer.concat([prefix, new Buffer(String(this.lightTxHash.length)), new Buffer(this.lightTxHash)]));
    let sig = this._crypto.sign(ethMsgHash);
    return {
      r: '0x' + sig.r.toString('hex'),
      s: '0x' + sig.s.toString('hex'),
      v: sig.v
    };
  }
}

export default lightTransaction;
