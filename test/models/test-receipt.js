import assert from 'assert';
import LightTransaction from '@/models/light-transaction'
import Receipt from '@/models/receipt'

describe('Receipt', () => {
  describe('#constructor ()', () => {
    let lightTx;
    let receipt;
    let receiptData;
    it('check if lightTx instanceof LightTransaction object or not.', () => {
      let ltxData = {
        fee: 3,
        type: 'deposit',
        to: '0x456',
        from: '0x123',
        value: 100,
        LSN: '123',
        stageHeight: 1,
        foo: 'bar'
      };

      lightTx = new LightTransaction(ltxData);
      assert.deepEqual(lightTx instanceof LightTransaction, true);
    });

    it('checks if all receiptDataKeys are included', () => {
      receiptData = {
        GSN: 21,
        lightTxHash:'6e7f1007bfb89f5af93fb9498fda2e9ca727166ccabd3a7109fa83e9d46d3f1a',
        fromBalance: 50,
        toBalance: 500
      };
  
      receipt = new Receipt(lightTx, receiptData);
      assert.deepEqual(Object.keys(receipt.receiptData), ['GSN', 'lightTxHash', 'fromBalance', 'toBalance']);
    });

    it('returns correct receipt', () => {
      let result = {
        receiptHash: 'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470',
        receiptData: receiptData
      };
      
      assert.deepEqual(receipt.receiptData, result.receiptData);
      assert.deepEqual(receipt.receiptHash, result.receiptHash);
    });
  });
});
