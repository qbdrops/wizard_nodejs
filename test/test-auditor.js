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
import receiptsWithSkippedGSN from '#/test-auditor-data/skipped-GSN.json';
import receiptsWithoutIntegrity from '#/test-auditor-data/integrity.json';

nock('http://localhost:3000').
  get('/sidechain/address').
  reply(200, { address: '0x7da24d4a346e0c4bb6e1f03c303a846faa467beb' }).
  get('/server/address').
  reply(200, { address: '0xfb44fa0865747558066266061786e69336b5f3a2' });

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
      // let res = await infinitechain.auditor.audit(stageHeight, receiptsWithRepeatedGSN, initialBalances, bond);
      // let res = await infinitechain.auditor.audit(stageHeight, receiptsWithWrongBalances, initialBalances, bond);
      let res = await infinitechain.auditor.audit(stageHeight, receipts, initialBalances, bond);
      // let res = await infinitechain.auditor.audit(stageHeight, receiptsWithoutIntegrity, initialBalances, bond);
      console.log(res);
    });
  });
});
