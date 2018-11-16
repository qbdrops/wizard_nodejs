import EthUtils from 'ethereumjs-util';
import assert from 'assert';
import types from '@/models/types';

const allowedLightTxDataKeys = ['from', 'to', 'assetID', 'value', 'fee', 'nonce', 'logID', 'clientMetadataHash'];
const allowedSigKeys = ['clientLightTx', 'serverLightTx'];
const allowedMetadataKeys = ['client', 'server'];
const instantWithdrawalLimit = 10;

class LightTransaction {
  constructor (lightTxJson) {
    // Check if recceiptJson has correct keys
    assert(lightTxJson.hasOwnProperty('lightTxData'), 'Paramter \'lightTxJson\' should have key \'lightTxData\'.');

    let lightTxData = lightTxJson.lightTxData;
    let sig = Object.assign({ clientLightTx: {}, serverLightTx: {} }, lightTxJson.sig);
    let metadata = Object.assign({ client: '', server: '' }, lightTxJson.metadata);
    assert(typeof metadata.client == 'string', 'Paramter \'metadata.client\' should be a string type.');
    assert(typeof metadata.server == 'string', 'Paramter \'metadata.server\' should be a string type.');

    // Remove keys which are not in the whitelist
    Object.keys(lightTxData).forEach(key => {
      if (!allowedLightTxDataKeys.includes(key)) {
        delete lightTxData[key];
      }
    });

    Object.keys(sig).forEach(key => {
      if (!allowedSigKeys.includes(key)) {
        delete sig[key];
      }
    });

    Object.keys(metadata).forEach(key => {
      if (!allowedMetadataKeys.includes(key)) {
        delete metadata[key];
      }
    });

    // Check if all lightTxData keys are included
    // Meanwhile make an ordered lightTxData
    let keys = Object.keys(lightTxData);
    let orderedLightTxData = {};
    allowedLightTxDataKeys.forEach(key => {
      if (key != 'clientMetadataHash') {
        assert(keys.includes(key), 'Parameter \'lightTxData\' does not include key \'' + key + '\'.');
      }
      orderedLightTxData[key] = (lightTxData[key] || lightTxData[key] == 0) ? lightTxData[key] : '';
    });

    // Check if sig has correct format
    Object.keys(sig).forEach(key => {
      let _s = Object.keys(sig[key]).sort().toString();
      let isSigFormatCorrect = (_s == 'r,s,v');
      let isSigDefault = (_s == '');
      assert(isSigFormatCorrect || isSigDefault, '\'sig\' does not have correct format.');
    });

    this.lightTxData = this._normalize(orderedLightTxData);
    this.lightTxData.clientMetadataHash = this._sha3(metadata.client);
    this.sig = sig;
    this.lightTxHash = this._sha3(Object.values(this.lightTxData).reduce((acc, curr) => acc + curr, ''));
    this.metadata = metadata;
  }

  _normalize = (lightTxData) => {
    lightTxData.from    = this._remove0x(lightTxData.from).padStart(64, '0').slice(-64).toLowerCase();
    lightTxData.to      = this._remove0x(lightTxData.to).padStart(64, '0').slice(-64).toLowerCase();
    lightTxData.logID   = this._remove0x(lightTxData.logID).padStart(64, '0').slice(-64).toLowerCase();
    lightTxData.nonce   = this._remove0x(lightTxData.nonce).padStart(64, '0').slice(-64).toLowerCase();
    lightTxData.assetID = this._remove0x(lightTxData.assetID).padStart(64, '0').slice(-64).toLowerCase();
    lightTxData.value   = this._to32BytesHex(lightTxData.value, true);
    lightTxData.fee     = this._to32BytesHex(lightTxData.fee, true);
    return lightTxData;
  }

  _to32BytesHex = (n, toWei) => {
    assert(typeof n == 'string', 'Please pass number as string to avoid precision errors.');

    let startWith0x = ((n.toString().slice(0, 2) == '0x') && (n.toString().substring(2).length == 64));
    let lengthIs64Bytes = (n.toString().length == 64);

    if (startWith0x || lengthIs64Bytes) {
      n = n.slice(-64).toLowerCase();
    } else {
      assert(/^(\d)+e(\+|-)?(\d)+$/i.test(n) === false, 'Do not pass numbers as scientific notation.');
      let h = '';
      if (toWei) {
        let sm = n.split('.');
        let base = this._toBN(10);
        let exp = 18;
        if (sm.length > 1) {
          assert(sm[1].length < exp, 'The fraction number is out of limit.');
          exp -= sm[1].length;
        }
        base = base.pow(this._toBN(exp));
        sm = this._toBN(sm.join(''));
        n = sm.mul(base);
      } else {
        n = this._toBN(n);
      }
      h = n.toString(16);
      assert(h != 'NaN', '\'' + n + '\' can not be parsed to an integer.');
      n = h.padStart(64, '0').toLowerCase();
    }

    return n;
  }

  _toBN = (value, base = 10) => {
    if (typeof value !== 'number' && typeof value !== 'string') {
      throw new Error('Unsupported type to big numnber.');
    }
    value = value.toString();
    return new EthUtils.BN(value, base);
  }

  _remove0x = (value) => {
    value = value.toString();
    if (value.slice(0, 2) == '0x') {
      value = value.substring(2);
    }
    return value;
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

  toJson = () => {
    let json = {
      lightTxHash: this.lightTxHash,
      lightTxData: this.lightTxData,
      sig: this.sig,
      metadata: this.metadata
    };
    return json;
  }

  toString = () => {
    return JSON.stringify(this.toJson());
  }

  _sha3 (content) {
    return EthUtils.sha3(content).toString('hex');
  }
}

export default LightTransaction;
