import assert from 'assert';
import InfinitechainBuilder from '@/infinitechain-builder';
import LightTransaction from '@/models/light-transaction';
import Receipt from '@/models/receipt';
import nock from 'nock';

nock('http://localhost:3000')
  .get('/contract/address')
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
    from: '0x123',
    to: '0x456',
    value: 100,
    LSN: '123',
    fee: 3,
    stageHeight: 1
  }, sig);

  let receipt = new Receipt(lightTx, {
    GSN: '123',
    lightTxHash: lightTx.lightTxHash,
    fromBalance: 100,
    toBalance: 0
  });

  describe('#signWithServerKey', () => {
    it('checks klass name', () => {
      let klass = 'foo';
      let object = lightTx;

      assert.throws(() => { ifc.signer.signWithServerKey(klass, object); }, Error, '\'klass\' should be \'lightTx\' or \'receipt\'');
    });

    it('checks object name', () => {
      let klass = 'lightTx';
      let object = 'bar';

      assert.throws(() => { ifc.signer.signWithServerKey(klass, object); }, Error, '\'object\' should be instance of \'lightTx\'.');
    });

    it('returns correct lightTx signature', () => {
      let klass = 'lightTx';
      let object = lightTx;

      let sig = ifc.signer.signWithServerKey(klass, object).sig;

      let result = {
        serverLightTx: {
          r: '0x772453cdcc3f35423c8bf5bc459ec849d9ecc4558f5c810f31b60dacb1fedad9',
          s: '0x62a4b5e1ccd5dcf9b278ca52c31afe9bfb2ffdfa6445f903d0d96ded2f02f7e9',
          v: 28
        }
      };

      assert.equal(sig.serverLightTx.r, result.serverLightTx.r);
      assert.equal(sig.serverLightTx.s, result.serverLightTx.s);
    });

    it('returns correct receipt signature', () => {
      let klass = 'receipt';
      let object = receipt;

      let sig = ifc.signer.signWithServerKey(klass, object).sig;

      let result = {
        serverReceipt: {
          r: '0x8e0c8e8271e23aa47658022ee5e6e78af7ab37428325e8e3099158a025fb1601',
          s: '0x126272b3fd5d5b1a98851f88a300c02a3184341ec4e254568975c090389a2cb5',
          v: 27
        }
      };

      assert.equal(sig.serverReceipt.r, result.serverReceipt.r);
      assert.equal(sig.serverReceipt.s, result.serverReceipt.s);
    });
  });

  describe('#signWithClientKey', () => {
    it('checks klass name', () => {
      let klass = 'foo';
      let object = lightTx;

      assert.throws(() => { ifc.signer.signWithClientKey(klass, object); }, Error, '\'klass\' should be \'lightTx\' or \'receipt\'');
    });

    it('checks object name', () => {
      let klass = 'lightTx';
      let object = 'bar';

      assert.throws(() => { ifc.signer.signWithClientKey(klass, object); }, Error, '\'object\' should be instance of \'lightTx\'.');
    });

    it('returns correct signature', () => {
      let klass = 'lightTx';
      let object = lightTx;

      let sig = ifc.signer.signWithClientKey(klass, object).sig;

      let result = {
        clientLightTx: {
          r: '0x772453cdcc3f35423c8bf5bc459ec849d9ecc4558f5c810f31b60dacb1fedad9',
          s: '0x62a4b5e1ccd5dcf9b278ca52c31afe9bfb2ffdfa6445f903d0d96ded2f02f7e9',
          v: 28
        }
      };

      assert.equal(sig.clientLightTx.r, result.clientLightTx.r);
      assert.equal(sig.clientLightTx.s, result.clientLightTx.s);
    });

    it('rejects client receipt signature', () => {
      let klass = 'receipt';
      let object = receipt;

      assert.throws(() => { ifc.signer.signWithClientKey(klass, object).sig; }, Error, '\'client\' is not permitted to sign receipt.');
    });
  });
});
