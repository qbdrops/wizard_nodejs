import assert from 'assert';
import IFCBuilder from '@/ifc-builder';
import IFC from '@/ifc';
import nock from 'nock';

nock('http://localhost:3000')
  .get('/contract/address')
  .reply(200, {address: '0x68c34a54ec562b2b6efc8e61c54f9314b93b1a44'});

describe('IFCBuilder', () => {
  describe('#constructor', () => {
    it('returns ifc object', () => {
      let ifc = new IFCBuilder().
        setNodeUrl('http://localhost:3000').
        setWeb3Url('http://localhost:8545').
        setStorage('memory').
        build();

      assert.equal(ifc instanceof IFC, true);
    });
  });
});
