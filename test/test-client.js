import assert from 'assert';
import InfinitechainBuilder from '@/infinitechain-builder';
import nock from 'nock';
import LightTransaction from '@/models/light-transaction';
import types from '@/models/types';

nock('http://localhost:3000').
  get('/booster/address').
  reply(200, { contractAddress: '0x68c34a54ec562b2b6efc8e61c54f9314b93b1a44', accountAddress: '0x68c34a54ec562b2b6efc8e61c54f9314b93b1a44' }).
  get('/server/address').
  reply(200, { address: '0x6c559983c9b0ec5dd61df4671cbe12e1d9aeefc5' }).
  get('/viable/stage/height').
  reply(200, { height: 1 });

describe('Client', () => {
  let infinitechain;
  let lightTxData;

  before(async () => {
    // runs before all tests in this block
    infinitechain = new InfinitechainBuilder().
      setNodeUrl('http://localhost:3000').
      setWeb3Url('wss://rinkeby.infura.io/_ws').
      setSignerKey('41b1a0649752af1b28b3dc29a1556eee781e4a4c3a1f7f53f90fa834de098c4d').
      setStorage('memory').
      build();

    await infinitechain.initialize();

    lightTxData = {
      from: '0x123',
      to: '0x456',
      value: '0.1',
      nonce: '1',
      assetID: 1,
      logID: 1,
      fee: '0.01'
    };
  });

  describe('#proposeDeposit', () => {
    it('returns signed lightTx', async () => {
      // let lightTx = await infinitechain.client.makeLightTx(types.deposit, lightTxData);
      // let txHash = await infinitechain.client.proposeDeposit(lightTx);
      // console.log('proposeDeposit txhash: ' + txHash);
      // console.log('lightTxHash: ' + lightTx.lightTxHash);
    });
  });
});
