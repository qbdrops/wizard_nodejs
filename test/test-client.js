import assert from 'assert';
import InfinitechainBuilder from '@/infinitechain-builder';
import nock from 'nock';
import LightTransaction from '../src/models/light-transaction';

nock('http://localhost:3000').
  get('/contract/address').
  reply(200, { address: '0x740d51da299f76fbbd1c8828c2c04d6852700fd8' }).
  get('/viable/stage/height').
  reply(200, { height: 1 });

describe('Client', async () => {
  let ifc = new InfinitechainBuilder().
    setNodeUrl('http://localhost:3000').
    setWeb3Url('http://localhost:8545').
    setSignerKey('41b1a0649752af1b28b3dc29a1556eee781e4a4c3a1f7f53f90fa834de098c4d').
    setClientAddress('0x123').
    setStorage('memory').
    build();

  await ifc.initialize();

  let lightTxData = {
    from: '0x123',
    to: '0x456',
    value: 10,
    LSN: 1,
    fee: 3
  };

  describe('#makeLightTx', () => {
    it('returns signed lightTx', async () => {
      let lightTx = await ifc.client.makeLightTx('deposit', lightTxData);

      let result = {
        clientLightTx: {
          r: '0xe63c51a6a4b318c2d717639d7d48a4eb3f31b6e3e90e6f356b1fd7e1d39a18a2',
          s: '0x1b58ecd5809c030c32152b56d023f2a273ff94e43d2c10df04ece4a988d0361f',
          v: 28
        }
      };

      assert.equal(lightTx.sig.clientLightTx.r, result.clientLightTx.r);
      assert.equal(lightTx.sig.clientLightTx.s, result.clientLightTx.s);
      assert.equal(lightTx instanceof LightTransaction, true);
    });
  });
});
