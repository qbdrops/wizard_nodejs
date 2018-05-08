class Level {
  constructor (db) {
    // Use level db
    this.db = db;
  }

  getReceiptHashesByStageHeight = async (stageHeight) => {
    let result;
    try {
      result = await this.db.get(stageHeight);
    } catch (e) {
      result = JSON.stringify([]);
    } finally {
      result = JSON.parse(result);
    }
    return result;
  }


  getLightTx = async (key) => {
    let result = await this.db.get('lightTx:' + key);
    return JSON.parse(result);
  }

  getReceipt = async (key) => {
    let result = await this.db.get('receipt:' + key);
    return JSON.parse(result);
  }

  setLightTx = async (key, value) => {
    await this.db.put('lightTx:' + key, JSON.stringify(value));
  }

  setReceipt = async (key, value) => {
    try {
      await this.db.put('receipt:' + key, JSON.stringify(value));
      await this._appendReceiptHash(value.receiptData.stageHeight, value.receiptHash);
    } catch (e) {
      console.log(e);
    }
  }

  _appendReceiptHash = async (stageHeight, receiptHash) => {
    let receiptHashes;
    try {
      receiptHashes = await this.db.get(stageHeight);
    } catch (e) {
      receiptHashes = JSON.stringify([]);
    } finally {
      receiptHashes = JSON.parse(receiptHashes);
      receiptHashes.push(receiptHash);
      await this.db.put(stageHeight, JSON.stringify(receiptHashes));
    }
  }
}

export default Level;
