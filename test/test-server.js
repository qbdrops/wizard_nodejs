import assert from 'assert';
import InfinitechainBuilder from '@/infinitechain-builder';
import nock from 'nock';
import LightTransaction from '@/models/light-transaction';
import Receipt from '@/models/receipt';
import types from '@/models/types';

nock('http://localhost:3000').
  get('/booster/address').
  reply(200, { contractAddress: '0x68c34a54ec562b2b6efc8e61c54f9314b93b1a44', accountAddress: '0x68c34a54ec562b2b6efc8e61c54f9314b93b1a44' }).
  get('/server/address').
  reply(200, { address: '0x6c559983c9b0ec5dd61df4671cbe12e1d9aeefc5' }).
  get('/viable/stage/height').
  reply(200, { height: 1 });

describe('Server', () => {
  let infinitechain;
  let signedReceipt;

  before(async () => {
    // runs before all tests in this block
    infinitechain = new InfinitechainBuilder().
      setNodeUrl('http://localhost:3000').
      setWeb3Url('ws://localhost:8546').
      setSignerKey('41b1a0649752af1b28b3dc29a1556eee781e4a4c3a1f7f53f90fa834de098c4d').
      setStorage('memory').
      build();

    await infinitechain.initialize();

    let lightTxJson = {
      lightTxData: {
        from: '0000000000000000000000000000000000000000000000000000000000000000',
        to: '000000000000000000000000fb44fa0865747558066266061786e69336b5f3a2',
        assetID: '0000000000000000000000000000000000000000000000000000000000000001',
        value: '000000000000000000000000000000000000000000000000016345785d8a0000',
        fee: '000000000000000000000000000000000000000000000000002386f26fc10000',
        nonce: '0000000000000000000000000000000000000000000000000000000000000001',
        logID: '0000000000000000000000000000000000000000000000000000000000000001'
      }
    };

    let lightTx = new LightTransaction(lightTxJson);
    let signedLightTx = infinitechain.signer.signWithClientKey(lightTx);
    signedLightTx = infinitechain.signer.signWithServerKey(lightTx);

    let receiptData = {
      stageHeight: 1,
      GSN: 1,
      lightTxHash: signedLightTx.lightTxHash,
      fromBalance: 20,
      toBalance: 40
    };

    let receiptJson = {
      lightTxHash: signedLightTx.lightTxHash,
      lightTxData: signedLightTx.lightTxData,
      sig: signedLightTx.sig,
      receiptData: receiptData,
      metadata: {
        client: '',
        server: ''
      }
    };

    let receipt = new Receipt(receiptJson);
  });

  describe('#deposit', () => {
    it('returns signed receipt', async () => {
      // let txHash = await infinitechain.server.deposit(signedReceipt);
      // console.log('Deposit txHash: ' + txHash);
      // console.log('lightTxHash: ' + signedReceipt.lightTxHash);
    });
  });
});
