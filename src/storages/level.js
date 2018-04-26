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

  get = async (key) => {
    let result = await this.db.get(key);
    return JSON.parse(result);
  }

  set = async (key, value) => {
    try {
      await this.db.put(key, JSON.stringify(value));
      this._appendReceiptHash(value.lightTxData.stageHeight, value.ReceiptHash);
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
