import assert from 'assert';
import LightTransaction from '@/models/light-transaction';

describe('LightTransaction', () => {
  describe('#constructor', () => {
    it('removes keys which are not in the whitelist', () => {
      let data = {
        fee: 3,
        type: 'deposit',
        to: '0x456',
        from: '0x123',
        value: 100,
        LSN: '123',
        stageHeight: 1,
        foo: 'bar'
      };

      let lightTx = new LightTransaction(data);
      assert.deepEqual(Object.keys(lightTx.lightTxData), ['type', 'from', 'to', 'value', 'fee', 'LSN', 'stageHeight']);
    });

    it('checks if all lightTxDataKeys are included', () => {
      let data = {
        fee: 3,
        type: 'foo',
        from: '0x123',
        value: 100,
        LSN: '123',
        stageHeight: 1
      };

      assert.throws(() => { new LightTransaction(data); }, Error, 'Parameter \'lightTxData\' does not include key \'to\'.');
    });

    it('checks lightTx type', () => {
      let data = {
        fee: 3,
        type: 'foo',
        to: '0x456',
        from: '0x123',
        value: 100,
        LSN: '123',
        stageHeight: 1
      };

      assert.throws(() => { new LightTransaction(data); }, Error, 'Parameter \'lightTxData\' does have correct \'type\'.');
    });

    it('returns correct lightTx', () => {
      let data = {
        fee: 3,
        type: 'deposit',
        to: '0x456',
        from: '0x123',
        value: 100,
        LSN: '123',
        stageHeight: 1
      };

      let lightTx = new LightTransaction(data);

      let result = {
        lightTxData: data,
        lightTxHash: '52eadc9689789b6b1dd281cdd488650b116b3ee071e76d6d9893e900996a0f30',
      };

      assert.deepEqual(lightTx.lightTxData, result.lightTxData);
      assert.deepEqual(lightTx.lightTxHash, result.lightTxHash);
    });
  });
});
