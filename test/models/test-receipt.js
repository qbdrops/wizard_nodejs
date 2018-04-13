import assert from 'assert';
import LightTransaction from '@/models/light-transaction';
import Receipt from '@/models/receipt';

describe('Receipt', () => {
  describe('#constructor', () => {
    let ltxData = {
      fee: 3,
      to: '0x456',
      from: '0x123',
      value: 100,
      LSN: '123',
      stageHeight: 1,
      foo: 'bar'
    };
    let sig = {
      clientLightTx:{
        v: 28,
        r:'0x384f9cb16fe9333e44b4ea8bba8cb4cb7cf910252e32014397c73aff5f94480c',
        s:'0x55305fc94b234c21d0025a8bce1fc20dbc7a83b48a66abc3cfbfdbc0a28c5709'
      },
      serverLightTx:{
        v: 28,
        r:'0x384f9cb16fe9333e44b4ea8bba8cb4cb7cf910252e32014397c73aff5f94480c',
        s:'0x55305fc94b234c21d0025a8bce1fc20dbc7a83b48a66abc3cfbfdbc0a28c5709'
      } 
    };

    let correctLightTx = new LightTransaction(ltxData, sig);
    let correctReceiptData = {
      GSN: 21,
      lightTxHash: correctLightTx.lightTxHash,
      fromBalance: 50,
      toBalance: 500
    };

    it('check if lightTx instanceof LightTransaction object or not.', () => {
      assert.equal(correctLightTx instanceof LightTransaction, true);
    });

    it('check if lightTx"s serverLightTx signature is empty or not.', () => {
      let wrongSig = {
        clientLightTx: {},
        serverLightTx: {
          v: 28,
          r:'0x384f9cb16fe9333e44b4ea8bba8cb4cb7cf910252e32014397c73aff5f94480c',
          s:'0x55305fc94b234c21d0025a8bce1fc20dbc7a83b48a66abc3cfbfdbc0a28c5709'
        }
      };
      let wrongLightTx = new LightTransaction(ltxData, wrongSig);
      assert.throws(() => { new Receipt(wrongLightTx, correctReceiptData); }, Error, 'Client signature is empty.');
    });

    it('checks if all receiptDataKeys are included', () => {
      let wrongReceiptData = {
        GSN: 21,
        lightTxHash:'12345',
        toBalance: 500,
        hello: 'hello'
      };

      assert.throws(() => { new Receipt(correctLightTx, wrongReceiptData); }, Error, 'Parameter \'receiptData\' does not include key \'to\'.');
    });

    it('returns correct receipt', () => {
      let receipt = new Receipt(correctLightTx, correctReceiptData);
      let result = {
        receiptHash: 'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470',
        receiptData: correctReceiptData
      };
      
      assert.deepEqual(receipt.receiptData, result.receiptData);
      assert.deepEqual(receipt.receiptHash, result.receiptHash);
    });
  });
});