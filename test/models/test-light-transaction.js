import assert from 'assert';
import LightTransaction from '@/models/light-transaction';
import types from '@/models/types';
import EthUtils from 'ethereumjs-util';

describe('LightTransaction', () => {
  describe('#constructor', () => {
    it('removes keys which are not in the whitelist', () => {
      let data = {
        lightTxData: {
          fee: '3',
          to: '0x456',
          from: '0x123',
          value: '100',
          nonce: '123',
          assetID: '1',
          logID: '1',
          foo: 'bar'
        }
      };

      let lightTx = new LightTransaction(data);
      assert.deepEqual(Object.keys(lightTx.lightTxData), ['from', 'to', 'assetID', 'value', 'fee', 'nonce', 'logID', 'clientMetadataHash']);
    });

    it('checks if all lightTxData keys are included', () => {
      let data = {
        lightTxData: {
          fee: '3',
          from: '0x123',
          value: '100',
          nonce: '123',
          assetID: '1',
          logID: '1'
        }
      };

      assert.throws(() => { new LightTransaction(data); }, Error, 'Parameter \'lightTxData\' does not include key \'to\'.');
    });

    it('checks if all sig has correct format', () => {
      let data = {
        lightTxData: {
          fee: '3',
          from: '0x123',
          to: '0x456',
          value: '100',
          nonce: '123',
          assetID: 1,
          logID: '1'
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
          fee: '3',
          to: '0x456',
          from: '0x123',
          value: '100',
          nonce: '123',
          assetID: 1,
          logID: 1
        },
        metadata: { client: JSON.stringify({ foo: 'bar' }) }
      };

      let lightTx = new LightTransaction(data);

      let result = {
        lightTxData: {
          from: '0000000000000000000000000000000000000000000000000000000000000123',
          to: '0000000000000000000000000000000000000000000000000000000000000456',
          assetID: '0000000000000000000000000000000000000000000000000000000000000001',
          value: '0000000000000000000000000000000000000000000000056bc75e2d63100000',
          fee: '00000000000000000000000000000000000000000000000029a2241af62c0000',
          nonce: '0000000000000000000000000000000000000000000000000000000000000123',
          logID: '0000000000000000000000000000000000000000000000000000000000000001',
          clientMetadataHash: '0c67568ef95afd46944fae1abc2b7d6227aa410e6250a554cbaab0fb17074205'
        },
        lightTxHash: '2a60af4eed6f76a481716773e96b2df372807727e07fed6da3a9179c91460331'
      };

      assert.deepEqual(lightTx.lightTxData, result.lightTxData);
      assert.deepEqual(lightTx.lightTxHash, result.lightTxHash);
    });
  });

  describe('#type', () => {
    it('returns correct lightTx type', () => {
      let data1 = {
        lightTxData: {
          fee: '3',
          to: '123',
          from: '0',
          value: '10',
          nonce: '123',
          assetID: 1,
          logID: 1
        }
      };

      let data2 = {
        lightTxData: {
          fee: '3',
          to: '123',
          from: '456',
          value: '10',
          nonce: '123',
          assetID: 1,
          logID: 1
        }
      };

      let data3 = {
        lightTxData: {
          fee: '3',
          to: '0',
          from: '123',
          value: '1',
          nonce: '123',
          assetID: 1,
          logID: 1
        }
      };

      let data4 = {
        lightTxData: {
          fee: '3',
          to: '0',
          from: '123',
          value: '11',
          nonce: '123',
          assetID: 1,
          logID: 1
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

  describe('#toJson', () => {
    let data = {
      lightTxData: {
        from: 'ce44fa4565747558066266061786e69336b5f3a2',
        to: 'fb44fa0865747558066266061786e69336b5f3a2',
        value: '0.5',
        fee: '0.1',
        nonce: '5',
        assetID: 1,
        logID: 1
      }
    };

    it('returns correct json object', () => {
      let lightTx = new LightTransaction(data);

      let expected = {
        lightTxHash: '5fa88f565b52e2bfcd78ac6f3fbbed8df5e88692e0b1a537a0bb8e3d11a5bb22',
        lightTxData: {
          from: '000000000000000000000000ce44fa4565747558066266061786e69336b5f3a2',
          to: '000000000000000000000000fb44fa0865747558066266061786e69336b5f3a2',
          assetID: '0000000000000000000000000000000000000000000000000000000000000001',
          value: '00000000000000000000000000000000000000000000000006f05b59d3b20000',
          fee: '000000000000000000000000000000000000000000000000016345785d8a0000',
          nonce: '0000000000000000000000000000000000000000000000000000000000000005',
          logID: '0000000000000000000000000000000000000000000000000000000000000001',
          clientMetadataHash: 'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'
        },
        metadata: {
          client: '',
          server: ''
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
        value: '0.5',
        fee: '0.1',
        nonce: '5',
        assetID: 1,
        logID: 1
      }
    };

    it('returns correct json object', () => {
      let lightTx = new LightTransaction(data);

      let expected = JSON.stringify({
        lightTxHash: '5fa88f565b52e2bfcd78ac6f3fbbed8df5e88692e0b1a537a0bb8e3d11a5bb22',
        lightTxData: {
          from: '000000000000000000000000ce44fa4565747558066266061786e69336b5f3a2',
          to: '000000000000000000000000fb44fa0865747558066266061786e69336b5f3a2',
          assetID: '0000000000000000000000000000000000000000000000000000000000000001',
          value: '00000000000000000000000000000000000000000000000006f05b59d3b20000',
          fee: '000000000000000000000000000000000000000000000000016345785d8a0000',
          nonce: '0000000000000000000000000000000000000000000000000000000000000005',
          logID: '0000000000000000000000000000000000000000000000000000000000000001',
          clientMetadataHash: 'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'
        },
        sig: {
          clientLightTx: {},
          serverLightTx: {}
        },
        metadata: {
          client: '',
          server: ''
        }
      });

      assert.equal(lightTx.toString(), expected);
    });
  });

  describe('#precision', () => {
    let data = {
      lightTxData : {
        from: 'ce44fa4565747558066266061786e69336b5f3a2',
        to: 'fb44fa0865747558066266061786e69336b5f3a2',
        value: '5994.9914',
        fee: '0.1',
        nonce: '5',
        assetID: 1,
        logID: 1
      }
    };
    it('ltght tx value must equal', () => {
      let lightTx = new LightTransaction(data);
      let expected = new EthUtils.BN(59949914);
      let base = new EthUtils.BN(1E14);
      expected = expected.mul(base);
      assert.equal(lightTx.lightTxData.value, expected.toString(16).padStart(64, '0'));
    });
  });
});
