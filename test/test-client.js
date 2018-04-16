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
    LSN: 17,
    fee: 3
  };

  describe('#makeLightTx', () => {
    it('returns signed lightTx', async () => {
      let lightTx = await ifc.client.makeLightTx('deposit', lightTxData);

      let result = {
        clientLightTx: {
          r: '0x4bb8e51f333e119231ccad91dd84b0648047736f16b13316513ab5696f86727a',
          s: '0x7dd1087f0ad556bd1ca2fb4d8679e1dd02bd2d77ec2d7dfe456b609bd1d5e3c5',
          v: 28
        }
      };

      assert.equal(lightTx.sig.clientLightTx.r, result.clientLightTx.r);
      assert.equal(lightTx.sig.clientLightTx.s, result.clientLightTx.s);
      assert.equal(lightTx instanceof LightTransaction, true);
    });
  });

  describe('#proposeDeposit', () => {
    it('returns txHash', async () => {
      let lightTx = await ifc.client.makeLightTx('deposit', lightTxData);
      await ifc.client.proposeDeposit(lightTx);
    });
  });
});
