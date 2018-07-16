class Level {
  constructor (db) {
    // Use level db
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
      result = await this.db.get(stageHeight);
    } catch (e) {
      result = [];
    }
    return result;
  }


  getLightTx = async (key) => {
    let result = await this.db.get('lightTx:' + key);
    return result;
  }

  getReceipt = async (key) => {
    let result = await this.db.get('receipt:' + key);
    return result;
  }

  setLightTx = async (key, value) => {
    await this.db.put('lightTx:' + key, value);
  }

  setReceipt = async (key, receiptJson) => {
    try {
      let address = '0x' + this._infinitechain.signer.getAddress();
      await this.db.put('receipt:' + key, receiptJson);
      await this._appendReceiptHash(receiptJson.receiptData.stageHeight, receiptJson.receiptHash);
      await this.syncer.uploadReceipt(address, receiptJson);
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
    this.syncer.setToken(token);
    await this.db.put('syncToken', token);
  }

  syncReceipts = async () => {
    let address = '0x' + this._infinitechain.signer.getAddress();
    let receipts = await this.syncer.getReceiptsOfFolder(address);
    console.log(receipts);
  }
}

export default Level;
