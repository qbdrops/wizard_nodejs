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
    setWeb3Url('http://localhost:8545').
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
          r: '0x9031d1f9cf13f7014826558375501e7802b796072a0934c8aed661bac9718407',
          s: '0x4d98c83c20b54f30d329e6e49a088a36dad38c272226375245379a4d5e529fc4',
          v: 28
        }
      };

      assert.equal(sig.serverLightTx.r, result.serverLightTx.r);
      assert.equal(sig.serverLightTx.s, result.serverLightTx.s);
    });

    it('returns correct receipt signature', () => {
      let object = receipt;

      let sig = ifc.signer.signWithServerKey(object).sig;

      let result = {
        serverReceipt: {
          r: '0xc28d6957877c6ea5b970bf58131eb3a16ef0d8b2699891453ba476f493e99694',
          s: '0x1062a197399268942b6433014b3b34eb68ef70ab90420c815cc7afc3fdc39bcb',
          v: 28
        }
      };

      assert.equal(sig.serverReceipt.r, result.serverReceipt.r);
      assert.equal(sig.serverReceipt.s, result.serverReceipt.s);
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
          r: '0x9031d1f9cf13f7014826558375501e7802b796072a0934c8aed661bac9718407',
          s: '0x4d98c83c20b54f30d329e6e49a088a36dad38c272226375245379a4d5e529fc4',
          v: 28
        }
      };

      assert.equal(sig.clientLightTx.r, result.clientLightTx.r);
      assert.equal(sig.clientLightTx.s, result.clientLightTx.s);
    });

    it('rejects client receipt signature', () => {
      let object = receipt;

      assert.throws(() => { ifc.signer.signWithClientKey(object).sig; }, Error, '\'client\' is not permitted to sign receipt.');
    });
  });
});
