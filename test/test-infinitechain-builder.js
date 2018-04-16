import assert from 'assert';
import InfinitechainBuilder from '@/infinitechain-builder';
import Infinitechain from '@/infinitechain';
import nock from 'nock';

nock('http://localhost:3000')
  .get('/contract/address')
  .reply(200, { address: '0x68c34a54ec562b2b6efc8e61c54f9314b93b1a44' });

describe('InfinitechainBuilder', () => {
  describe('#constructor', () => {
    it('returns infinitechain object', () => {
      let infinitechain = new InfinitechainBuilder().
        setNodeUrl('http://localhost:3000').
        setSidechainId('1').
        setWeb3Url('http://localhost:8545').
        setStorage('memory').
        build();

      assert.equal(infinitechain instanceof Infinitechain, true);
    });
  });
});
