import assert from 'assert';
import InfinitechainBuilder from '@/infinitechain-builder';
import LightTransaction from '@/models/light-transaction';
import Receipt from '@/models/receipt';
import nock from 'nock';

nock('http://localhost:3000')
  .get('/booster/address')
  .reply(200, { address: '0x68c34a54ec562b2b6efc8e61c54f9314b93b1a44' });

describe('Signer', () => {
  let ifc = new InfinitechainBuilder().
    setNodeUrl('http://localhost:3000').
    setWeb3Url('ws://localhost:8546').
    setSignerKey('41b1a0649752af1b28b3dc29a1556eee781e4a4c3a1f7f53f90fa834de098c4d').
    setStorage('memory').
    build();
  let sig = {
    clientLightTx:{
      v: 28,
      r:'0x384f9cb16fe9333e44b4ea8bba8cb4cb7cf910252e32014397c73aff5f94480c',
      s:'0x55305fc94b234c21d0025a8bce1fc20dbc7a83b48a66abc3cfbfdbc0a28c5709'
    },
    serverLightTx:{
      v: 28,
      r:'0x384f9cb16fe9333e44b4ea8bba8cb4cb7cf910252e32014397c73aff5f94480c',
      s:'0x55305fc94b234c21d0025a8bce1fc20dbc7a83b48a66abc3cfbfdbc0a28c5709'
    }
  };

  let lightTx = new LightTransaction({
    lightTxData: {
      from: '0x123',
      to: '0x456',
      value: 100,
      nonce: '123',
      assetID: 1,
      logID: 1,
      fee: 3
    },
    sig: sig
  });

  let receiptData = {
    stageHeight: 1,
    GSN: '123',
    lightTxHash: lightTx.lightTxHash,
    fromBalance: 100,
    toBalance: 0
  };

  let receiptJson = {
    lightTxData: lightTx.lightTxData,
    lightTxHash: lightTx.lightTxHash,
    sig: lightTx.sig,
    receiptData: receiptData,
    metadata: {
      client: '',
      server: ''
    }
  };

  let receipt = new Receipt(receiptJson);

  describe('#signWithServerKey', () => {
    it('checks object name', () => {
      let object = 'bar';

      assert.throws(() => { ifc.signer.signWithServerKey(object); }, Error, '\'object\' should be instance of \'LightTransaction\' or \'Receipt\'.');
    });

    it('returns correct lightTx signature', () => {
      let object = lightTx;

      let sig = ifc.signer.signWithServerKey(object).sig;

      let result = {
        serverLightTx: {
          r: '0x18fa9cc76adda45a236a72c9dc7cfde3c673eefcd9cf70d811b8362889863043',
          s: '0x700446c703472c25e2623a48e1aeaeca35bfa57e3ca0188bd5baa429eb330804',
          v: 28
        }
      };

      assert.equal(sig.serverLightTx.r, result.serverLightTx.r);
      assert.equal(sig.serverLightTx.s, result.serverLightTx.s);
    });
  });

  describe('#signWithClientKey', () => {
    it('checks object name', () => {
      let object = 'bar';

      assert.throws(() => { ifc.signer.signWithClientKey(object); }, Error, '\'object\' should be instance of \'LightTransaction\' or \'Receipt\'.');
    });

    it('returns correct signature', () => {
      let object = lightTx;

      let sig = ifc.signer.signWithClientKey(object).sig;

      let result = {
        clientLightTx: {
          r: '0x18fa9cc76adda45a236a72c9dc7cfde3c673eefcd9cf70d811b8362889863043',
          s: '0x700446c703472c25e2623a48e1aeaeca35bfa57e3ca0188bd5baa429eb330804',
          v: 28
        }
      };

      assert.equal(sig.clientLightTx.r, result.clientLightTx.r);
      assert.equal(sig.clientLightTx.s, result.clientLightTx.s);
    });
  });
});
