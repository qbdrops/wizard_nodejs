import assert from 'assert';
import IFCBuilder from '@/ifc-builder';
import LightTransaction from '@/models/light-transaction';
import nock from 'nock';

nock('http://localhost:3000')
  .get('/contract/address')
  .reply(200, { address: '0x68c34a54ec562b2b6efc8e61c54f9314b93b1a44' });

describe('Signer', () => {
  let ifc = new IFCBuilder().
    setNodeUrl('http://localhost:3000').
    setWeb3Url('http://localhost:8545').
    setSignerKey('41b1a0649752af1b28b3dc29a1556eee781e4a4c3a1f7f53f90fa834de098c4d').
    setStorage('memory').
    build();

  let lightTx = new LightTransaction({
    type: 'deposit',
    from: '0x123',
    to: '0x456',
    value: 100,
    LSN: '123',
    fee: 3,
    stageHeight: 1
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
  });
});
