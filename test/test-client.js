import assert from 'assert';
import InfinitechainBuilder from '@/infinitechain-builder';
import nock from 'nock';
import LightTransaction from '../src/models/light-transaction';

nock('http://localhost:3000').
  get('/contract/address').
  reply(200, { address: '0x57b9cc7ff8e82d4f7852d655383b92d439df98ea' }).
  get('/viable/stage/height').
  reply(200, { height: 1 });

describe('Client', () => {
  let ifc = new InfinitechainBuilder().
    setNodeUrl('http://localhost:3000').
    setSidechainId('1').
    setWeb3Url('http://localhost:8545').
    setSignerKey('41b1a0649752af1b28b3dc29a1556eee781e4a4c3a1f7f53f90fa834de098c4d').
    setClientAddress('0x123').
    setStorage('memory').
    build();

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
          r: '0x555f64e39e6986157aae9a4808edc11a4a75641f6d5bce0dcebbc78ce591a48f',
          s: '0x6db5aba119fddd6ca4a661c9a9a18d23c39cc789428862c2f61ba798adda12ef',
          v: 28
        }
      };

      assert.equal(lightTx.sig.clientLightTx.r, result.clientLightTx.r);
      assert.equal(lightTx.sig.clientLightTx.s, result.clientLightTx.s);
      assert.equal(lightTx instanceof LightTransaction, true);
    });
  });
});
