import assert from 'assert';
import IFCBuilder from '@/ifc-builder';
import IFC from '@/ifc';

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
