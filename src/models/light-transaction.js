import EthUtils from 'ethereumjs-util';
import assert from 'assert';

const allowedLightTxDataKeys = ['from', 'to', 'value', 'fee', 'LSN', 'stageHeight'];

class LightTransaction {
  constructor (lightTxData) {
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

    this.lightTxData = orderedLightTxData;
    this.lightTxHash = EthUtils.sha3(JSON.stringify(this.lightTxData)).toString('hex');

    this.sig = { clientLightTx: {}, serverLightTx: {} };
  }
}

export default LightTransaction;
