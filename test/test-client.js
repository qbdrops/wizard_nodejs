import assert from 'assert';
import InfinitechainBuilder from '@/infinitechain-builder';
import nock from 'nock';
import LightTransaction from '@/models/light-transaction';
import types from '@/models/types';

nock('http://localhost:3000').
  get('/sidechain/address').
  reply(200, { address: '0xceb56f5781ca9ef2cc34819f778d041357c81c14' }).
  get('/server/address').
  reply(200, { address: '0x6c559983c9b0ec5dd61df4671cbe12e1d9aeefc5' }).
  get('/viable/stage/height').
  reply(200, { height: 1 });

describe('Client', async () => {
  let ifc = new InfinitechainBuilder().
    setNodeUrl('http://localhost:3000').
    setWeb3Url('http://localhost:8545').
    setSignerKey('41b1a0649752af1b28b3dc29a1556eee781e4a4c3a1f7f53f90fa834de098c4d').
    setStorage('memory').
    build();

  await ifc.initialize();

  let lightTxData = {
    from: '0x123',
    to: '0x456',
    value: 0.1,
    LSN: 1,
    fee: '0.01'
  };

  describe('#makeLightTx', () => {
    it('returns signed lightTx', async () => {
      let lightTx = await ifc.client.makeLightTx(types.deposit, lightTxData);

      let result = {
        lightTxHash: '74d21f1502ea9ef35c8b6f50b5a42d2f874b7e16723b4508cd8d8e6063ae2ddb'
      };

      // let txHash = await ifc.client.proposeDeposit(lightTx);
      // console.log(txHash);

      assert.equal(lightTx.lightTxHash, result.lightTxHash);
      assert.equal(lightTx instanceof LightTransaction, true);
    });
  });
});
