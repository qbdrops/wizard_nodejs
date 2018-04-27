import assert from 'assert';
import LightTransaction from '@/models/light-transaction';
import types from '@/models/types';

describe('LightTransaction', () => {
  describe('#constructor', () => {
    it('removes keys which are not in the whitelist', () => {
      let data = {
        lightTxData: {
          fee: 3,
          to: '0x456',
          from: '0x123',
          value: 100,
          LSN: '123',
          stageHeight: 1,
          foo: 'bar'
        }
      };

      let lightTx = new LightTransaction(data);
      assert.deepEqual(Object.keys(lightTx.lightTxData), ['from', 'to', 'value', 'fee', 'LSN', 'stageHeight']);
    });

    it('checks if all lightTxData keys are included', () => {
      let data = {
        lightTxData: {
          fee: 3,
          from: '0x123',
          value: 100,
          LSN: '123',
          stageHeight: 1
        }
      };

      assert.throws(() => { new LightTransaction(data); }, Error, 'Parameter \'lightTxData\' does not include key \'to\'.');
    });

    it('checks if all sig has correct format', () => {
      let data = {
        lightTxData: {
          fee: 3,
          from: '0x123',
          to: '0x456',
          value: 100,
          LSN: '123',
          stageHeight: 1
        },
        sig: {
          clientLightTx: {
            s: '0x456',
            v: 27
          }
        }
      };

      assert.throws(() => { new LightTransaction(data); }, Error, '\'sig\' does not have correct format.');
    });

    it('returns correct lightTx', () => {
      let data = {
        lightTxData: {
          fee: 3,
          to: '0x456',
          from: '0x123',
          value: 100,
          LSN: '123',
          stageHeight: 1
        }
      };

      let lightTx = new LightTransaction(data);

      let result = {
        lightTxData: {
          LSN: '000000000000000000000000000000000000000000000000000000000000007b',
          fee: '00000000000000000000000000000000000000000000000029a2241af62c0000',
          from: '000000000000000000000000000000000000000000000000000000000000x123',
          stageHeight: '0000000000000000000000000000000000000000000000000000000000000001',
          to: '000000000000000000000000000000000000000000000000000000000000x456',
          value: '0000000000000000000000000000000000000000000000056bc75e2d63100000'
        },
        lightTxHash: 'cd10ce326eb5402c46136d7f1ccf3d4db16198b938b348a126e5bfe7549cd49b',
      };

      assert.deepEqual(lightTx.lightTxData, result.lightTxData);
      assert.deepEqual(lightTx.lightTxHash, result.lightTxHash);
    });
  });

  describe('#type', () => {
    it('returns correct lightTx type', () => {
      let data1 = {
        lightTxData: {
          fee: 3,
          to: '123',
          from: '0',
          value: 10,
          LSN: '123',
          stageHeight: 1
        }
      };

      let data2 = {
        lightTxData: {
          fee: 3,
          to: '123',
          from: '456',
          value: 10,
          LSN: '123',
          stageHeight: 1
        }
      };

      let data3 = {
        lightTxData: {
          fee: 3,
          to: '0',
          from: '123',
          value: 1,
          LSN: '123',
          stageHeight: 1
        }
      };

      let data4 = {
        lightTxData: {
          fee: 3,
          to: '0',
          from: '123',
          value: 11,
          LSN: '123',
          stageHeight: 1
        }
      };

      let lightTx1 = new LightTransaction(data1);
      let lightTx2 = new LightTransaction(data2);
      let lightTx3 = new LightTransaction(data3);
      let lightTx4 = new LightTransaction(data4);
      assert.equal(lightTx1.type(), types.deposit);
      assert.equal(lightTx2.type(), types.remittance);
      assert.equal(lightTx3.type(), types.instantWithdrawal);
      assert.equal(lightTx4.type(), types.withdrawal);
    });
  });

  describe('#parseProposeDeposit', () => {
    let eventData = {
      _lightTxHash: '0x43bc6fd91751563ee4c22c119c7095bf917928f648d079311cae1544a0126ad5',
      _client: '0x000000000000000000000000fb44fa0865747558066266061786e69336b5f3a2',
      _value: '0x000000000000000000000000000000000000000000000000016345785d8a0000',
      _fee: '0x000000000000000000000000000000000000000000000000002386f26fc10000',
      _lsn: '0x0000000000000000000000000000000000000000000000000000000000000001',
      _stageHeight: '0x0000000000000000000000000000000000000000000000000000000000000001',
      _v: '0x000000000000000000000000000000000000000000000000000000000000001b',
      _r: '0xe7c1ca9f2a5aa772048bc592b56a08482ac2e131c887c4f789af0c66208c0578',
      _s: '0x0abf10325d6e746e1a4ff5d3413e16dd3994778166620a51c578853a178867bd'
    };

    it('returns a LightTransaction object from a proposeDeposit event', () => {
      let lightTx = LightTransaction.parseProposeDeposit(eventData);

      let expected = {
        from: '0000000000000000000000000000000000000000000000000000000000000000',
        to: '000000000000000000000000fb44fa0865747558066266061786e69336b5f3a2',
        value: '000000000000000000000000000000000000000000000000016345785d8a0000',
        fee: '000000000000000000000000000000000000000000000000002386f26fc10000',
        LSN: '0000000000000000000000000000000000000000000000000000000000000001',
        stageHeight: '0000000000000000000000000000000000000000000000000000000000000001'
      };

      assert.deepEqual(lightTx.lightTxData, expected);
    });
  });

  describe('#toJson', () => {
    let data = {
      lightTxData: {
        from: 'ce44fa4565747558066266061786e69336b5f3a2',
        to: 'fb44fa0865747558066266061786e69336b5f3a2',
        value: 0.5,
        fee: 0.1,
        LSN: 5,
        stageHeight: 1
      }
    };

    it('returns correct json object', () => {
      let lightTx = new LightTransaction(data);

      let expected = {
        lightTxHash: 'bbd7d934b0d1789da4c88ee93829bb4d18eaf71bdb638e07a697b05fb0c74c95',
        lightTxData: {
          from: '000000000000000000000000ce44fa4565747558066266061786e69336b5f3a2',
          to: '000000000000000000000000fb44fa0865747558066266061786e69336b5f3a2',
          value: '00000000000000000000000000000000000000000000000006f05b59d3b20000',
          fee: '000000000000000000000000000000000000000000000000016345785d8a0000',
          LSN: '0000000000000000000000000000000000000000000000000000000000000005',
          stageHeight: '0000000000000000000000000000000000000000000000000000000000000001'
        },
        sig: {
          clientLightTx: {},
          serverLightTx: {}
        }
      };

      assert.deepEqual(lightTx.toJson(), expected);
    });
  });

  describe('#toString', () => {
    let data = {
      lightTxData : {
        from: 'ce44fa4565747558066266061786e69336b5f3a2',
        to: 'fb44fa0865747558066266061786e69336b5f3a2',
        value: 0.5,
        fee: 0.1,
        LSN: 5,
        stageHeight: 1
      }
    };

    it('returns correct json object', () => {
      let lightTx = new LightTransaction(data);

      let expected = JSON.stringify({
        lightTxHash: 'bbd7d934b0d1789da4c88ee93829bb4d18eaf71bdb638e07a697b05fb0c74c95',
        lightTxData: {
          from: '000000000000000000000000ce44fa4565747558066266061786e69336b5f3a2',
          to: '000000000000000000000000fb44fa0865747558066266061786e69336b5f3a2',
          value: '00000000000000000000000000000000000000000000000006f05b59d3b20000',
          fee: '000000000000000000000000000000000000000000000000016345785d8a0000',
          LSN: '0000000000000000000000000000000000000000000000000000000000000005',
          stageHeight: '0000000000000000000000000000000000000000000000000000000000000001'
        },
        sig: {
          clientLightTx: {},
          serverLightTx: {}
        }
      });

      assert.equal(lightTx.toString(), expected);
    });
  });
});
