class Memory {
  constructor () {
    this.lightTxs = {};
    this.receipts = {};
  }

  setInfinitechain (infinitechain) {
    this._infinitechain = infinitechain;
  }

  setReceiptSyncer (syncer) {
    this.syncer = syncer;
  }

  getReceiptHashesByStageHeight = async (stageHeight) => {
    return Object.keys(this.data).map(key => {
      return this.data[key];
    }).filter(receipt => {
      return receipt.receiptData.stageHeight == stageHeight;
    }).map(receipt => receipt.receiptHash);
  }

  getLightTx = async (key) => {
    let result = this.lightTxs[key];
    return result;
  }

  getReceipt = async (key) => {
    let result = this.receipts[key];
    return result;
  }

  setLightTx = async (key, value) => {
    this.lightTxs[key] = value;
  }

  setReceipt = async (key, receiptJson) => {
    this.receipts[key] = receiptJson;
    let address = '0x' + this._infinitechain.signer.getAddress();
    await this.syncer.uploadReceipt(address, receiptJson);
  }
}

export default Memory;
