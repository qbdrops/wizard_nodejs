import assert from 'assert';
import InfinitechainBuilder from '@/infinitechain-builder';
import nock from 'nock';

nock('http://localhost:3000')
  .get('/sidechain/address')
  .reply(200, { address: '0x68c34a54ec562b2b6efc8e61c54f9314b93b1a44' })
  .get('/server/address')
  .reply(200, { address: '0x68c34a54ec562b2b6efc8e61c54f9314b93b1a44' });

describe('Infinitechain', () => {
  describe('#initialize', () => {
    it('sidechain object should not be null', async () => {
      let infinitechain = new InfinitechainBuilder().
        setNodeUrl('http://localhost:3000').
        setWeb3Url('http://localhost:8545').
        setSignerKey('41b1a0649752af1b28b3dc29a1556eee781e4a4c3a1f7f53f90fa834de098c4d').
        setStorage('memory').
        build();

      await infinitechain.initialize();

      assert.equal(infinitechain.contract.sidechain() !== null, true);
    });
  });
});
