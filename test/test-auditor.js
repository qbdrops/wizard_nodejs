import assert from 'assert';
import InfinitechainBuilder from '@/infinitechain-builder';
import nock from 'nock';
import LightTransaction from '@/models/light-transaction';
import Receipt from '@/models/receipt';
import types from '@/models/types';
import initialBalances from '#/test-auditor-data/initial-balances.json';
import receipts from '#/test-auditor-data/normal.json';
import receiptsWithRepeatedGSN from '#/test-auditor-data/repeated-GSN.json';
import receiptsWithWrongBalances from '#/test-auditor-data/wrong-balances.json';

nock('http://localhost:3000').
  get('/sidechain/address').
  reply(200, { address: '0x30e2098182a70ff37721783b3ae22dc09b84f254' }).
  get('/server/address').
  reply(200, { address: '0x6c559983c9b0ec5dd61df4671cbe12e1d9aeefc5' });

describe('Auditor', () => {
  let infinitechain;
  let stageHeight = 1;
  let bond = (1000*1e18).toString(16);

  before(async () => {
    // runs before all tests in this block
    infinitechain = new InfinitechainBuilder().
      setNodeUrl('http://localhost:3000').
      setWeb3Url('http://localhost:8545').
      setSignerKey('41b1a0649752af1b28b3dc29a1556eee781e4a4c3a1f7f53f90fa834de098c4d').
      setStorage('memory').
      build();

    await infinitechain.initialize();
  });

  describe('#audit', () => {
    it('returns correct result', async () => {
      // await infinitechain.auditor.audit(stageHeight, receiptsWithRepeatedGSN, initialBalances, bond);
      await infinitechain.auditor.audit(stageHeight, receiptsWithWrongBalances, initialBalances, bond);
      // await infinitechain.auditor.audit(stageHeight, receipts, initialBalances, bond);
    });
  });
});
