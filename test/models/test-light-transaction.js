import assert from 'assert';
import LightTransaction from '@/models/light-transaction';

describe('LightTransaction', () => {
  describe('#constructor', () => {
    it('removes keys which are not in the whitelist', () => {
      let data = {
        fee: 3,
        to: '0x456',
        from: '0x123',
        value: 100,
        LSN: '123',
        stageHeight: 1,
        foo: 'bar'
      };

      let lightTx = new LightTransaction(data);
      assert.deepEqual(Object.keys(lightTx.lightTxData), ['from', 'to', 'value', 'fee', 'LSN', 'stageHeight']);
    });

    it('checks if all lightTxData keys are included', () => {
      let data = {
        fee: 3,
        from: '0x123',
        value: 100,
        LSN: '123',
        stageHeight: 1
      };

      assert.throws(() => { new LightTransaction(data); }, Error, 'Parameter \'lightTxData\' does not include key \'to\'.');
    });

    it('checks if all sig has correct format', () => {
      let data = {
        fee: 3,
        from: '0x123',
        to: '0x456',
        value: 100,
        LSN: '123',
        stageHeight: 1
      };

      let sig = {
        clientLightTx: {
          s: '0x456',
          v: 27
        }
      };

      assert.throws(() => { new LightTransaction(data, sig); }, Error, '\'sig\' does not have correct format.');
    });

    it('returns correct lightTx', () => {
      let data = {
        fee: 3,
        to: '0x456',
        from: '0x123',
        value: 100,
        LSN: '123',
        stageHeight: 1
      };

      let lightTx = new LightTransaction(data);

      let result = {
        lightTxData: data,
        lightTxHash: 'a6041d6145871ef022f60659808ad19d64aa7e533b89c1c9ee0019ce3d1506a5',
      };

      assert.deepEqual(lightTx.lightTxData, result.lightTxData);
      assert.deepEqual(lightTx.lightTxHash, result.lightTxHash);
    });
  });
});
