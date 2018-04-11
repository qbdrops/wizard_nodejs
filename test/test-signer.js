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
          r: '0x2afadcfae03f6e780077e0673263ba60e160bc614c6ad299058c9d8723e6be0f',
          s: '0x61fb6b270f5f1383a4e7d67a28e3c3816ecb8c5cceea91df8ee953256fe07c4a',
          v: 28
        }
      };

      assert.equal(sig.serverLightTx.r, result.serverLightTx.r);
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
          r: '0x2afadcfae03f6e780077e0673263ba60e160bc614c6ad299058c9d8723e6be0f',
          s: '0x61fb6b270f5f1383a4e7d67a28e3c3816ecb8c5cceea91df8ee953256fe07c4a',
          v: 28
        }
      };

      assert.equal(sig.clientLightTx.r, result.clientLightTx.r);
    });
  });
});
