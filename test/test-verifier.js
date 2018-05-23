import assert from 'assert';
import InfinitechainBuilder from '@/infinitechain-builder';
import nock from 'nock';
import LightTransaction from '@/models/light-transaction';

nock('http://localhost:3000')
  .get('/sidechain/address')
  .reply(200, { address: '0x68c34a54ec562b2b6efc8e61c54f9314b93b1a44' })
  .get('/server/address')
  .reply(200, { address: '0x68c34a54ec562b2b6efc8e61c54f9314b93b1a44' });
  
describe('Verifier', async () => {
  let infinitechain = new InfinitechainBuilder().
    setNodeUrl('http://localhost:3000').
    setWeb3Url('http://localhost:8545').
    setSignerKey('41b1a0649752af1b28b3dc29a1556eee781e4a4c3a1f7f53f90fa834de098c4d').
    setStorage('memory').
    build();

  await infinitechain.initialize();

  let lightTxJson = {
    lightTxData: {
      from: '0',
      to: 'fb44fa0865747558066266061786e69336b5f3a2',
      value: 0.5,
      fee: 0.1,
      nonce: 1,
      assetID: 1,
      logID: 1
    }
  };

  let lightTx = new LightTransaction(lightTxJson);
  lightTx = infinitechain.signer.signWithClientKey(lightTx);

  describe('#verifyLightTx', () => {
    it('returns correct verification result', async () => {
      assert.equal(infinitechain.verifier.verifyLightTx(lightTx), true);
    });
  });
});
