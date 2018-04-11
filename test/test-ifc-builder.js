import assert from 'assert';
import IFCBuilder from '@/ifc-builder'
import IFC from '@/ifc'

describe('IFCBuilder', function () {
  describe('#constructor ()', function () {
    it('should return ifc object', function () {
      let ifc = new IFCBuilder().setNodeUrl('http://localhost:3000').
        setWeb3Url('http://localhost:8545').
        setStorage('memory').
        build();

      assert.equal(ifc instanceof IFC, true);
    });
  });
});
