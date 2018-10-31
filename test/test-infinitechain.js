import assert from 'assert';
import InfinitechainBuilder from '@/infinitechain-builder';
import nock from 'nock';

nock('http://localhost:3000')
  .get('/booster/address')
  .reply(200, { contractAddress: '0x68c34a54ec562b2b6efc8e61c54f9314b93b1a44', accountAddress: '0x68c34a54ec562b2b6efc8e61c54f9314b93b1a44' })
  .get('/server/address')
  .reply(200, { address: '0x68c34a54ec562b2b6efc8e61c54f9314b93b1a44' });

describe('Infinitechain', () => {
  let infinitechain;

  before(async () => {
    // runs before all tests in this block
    infinitechain = new InfinitechainBuilder().
      setNodeUrl('http://localhost:3000').
      setWeb3Url('ws://localhost:8546').
      setSignerKey('41b1a0649752af1b28b3dc29a1556eee781e4a4c3a1f7f53f90fa834de098c4d').
      setStorage('memory').
      build();

    await infinitechain.initialize();
  });

  describe('#initialize', () => {
    it('booster object should not be null', async () => {
      assert.equal(infinitechain.contract.booster() !== null, true);
    });
    it('web3 object should not be null', async () => {
      assert.equal(infinitechain.contract.web3() !== null, true);
    });
    it('erc20 object should not be null', async () => {
      assert.equal(infinitechain.contract.erc20('0x68c34a54ec562b2b6efc8e61c54f9314b93b1a44') !== null, true);
    });
  });
});
