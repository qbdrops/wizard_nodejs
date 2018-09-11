import assert from 'assert';

class Level {
  constructor (db) {
    this.db = db;
    this.syncer;
    this._infinitechain;
  }

  setInfinitechain (infinitechain) {
    this._infinitechain = infinitechain;
  }

  setReceiptSyncer (syncer) {
    this.syncer = syncer;
  }

  getReceiptHashesByStageHeight = async (stageHeight) => {
    let result;
    try {
      result = await this.db.get(parseInt(stageHeight));
    } catch (e) {
      result = [];
    }
    return result;
  }

  getReceipt = async (lightTxHash) => {
    let result = null;
    try {
      result = await this.db.get('receipt:' + lightTxHash);
    } catch (e) {
      if (e.type != 'NotFoundError') {
        console.error(e);
      }
    }
    return result;
  }

  getBlockNumber = async () => {
    let result;
    try {
      result = await this.db.get('blockNumber');
    } catch (e) {
      result = 0;
    }
    return result;
  }

  setBlockNumber = async (value) => {
    await this.db.put('blockNumber', value);
  }

  setReceipt = async (lightTxHash, receiptJson, upload = false) => {
    try {
      let address = '0x' + this._infinitechain.signer.getAddress();
      await this.db.put('receipt:' + lightTxHash, receiptJson);
      await this._appendReceiptHash(parseInt(receiptJson.receiptData.stageHeight), receiptJson.receiptHash);
      if (upload) {
        await this.syncer.uploadReceipt(address, receiptJson);
      }
    } catch (e) {
      console.log(e);
    }
  }

  _appendReceiptHash = async (stageHeight, receiptHash) => {
    let receiptHashes;
    try {
      receiptHashes = await this.db.get(stageHeight);
    } catch (e) {
      receiptHashes = [];
    } finally {
      receiptHashes.push(receiptHash);
      await this.db.put(stageHeight, receiptHashes);
    }
  }

  getSyncerToken = async () => {
    try {
      return await this.db.get('syncToken');
    } catch (e) {
      return null;
    }
  }

  saveSyncerToken = async (token) => {
    await this.db.put('syncToken', token);
  }

  syncReceipts = async () => {
    assert(this.syncer, 'Syncer is not provided.');

    let address = '0x' + this._infinitechain.signer.getAddress();
    let receipts = await this.syncer.getReceiptsOfFolder(address);
    let boosterContract = this._infinitechain.contract.booster();
    let stageHeight = await boosterContract.methods.stageHeight().call();
    stageHeight = parseInt(stageHeight);
    stageHeight += 1;

    try {
      let lightTxHashesOfReceipts = await this.db.get(stageHeight.toString(16).padStart(64, '0').slice(-64));
      // compare to lightTxHashesOfReceipts, store the rest, upload new receipts
      let receiptsInCloud = receipts.map((receipt) => {
        return receipt.name;
      });

      let shouldStoreReceipts = receiptsInCloud.filter((i) => {return lightTxHashesOfReceipts.indexOf(i) < 0;});
      let shouldUploadReceipts = lightTxHashesOfReceipts.filter((i) => {return receiptsInCloud.indexOf(i) < 0;});
      for (let i = 0; i < shouldStoreReceipts.length; i++) {
        let lightTxHash = shouldStoreReceipts[i];
        for (let j = 0; j < receipts.length; j++) {
          let receipt = receipts[j];
          if (lightTxHash == receipt.name) {
            try {
              let receiptJson = await this.syncer.download(receipt.id);
              console.log(receiptJson);
              if (receiptJson) {
                await this.setReceipt(receiptJson.lightTxHash, receiptJson);
              }
            } catch (e) {
              console.error(e);
            }
          }
        }
      }

      shouldUploadReceipts.forEach(async (lightTxHash) => {
        let receipt = await this.getReceipt(lightTxHash);
        await this.syncer.uploadReceipt(address, receipt);
      });
    } catch (e) {
      if (e.type == 'NotFoundError') {
        await this.db.put(stageHeight, []);
        receipts.forEach(async (receipt) => {
          try {
            let receiptJson = await this.syncer.download(receipt.id);
            if (receiptJson) {
              await this.setReceipt(receiptJson.lightTxHash, receiptJson);
            }
          } catch (e) {
            console.error(e);
          }
        });
      } else {
        console.error(e);
      }
    }
  }
}

export default Level;
