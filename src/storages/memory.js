class Memory {
  constructor () {
    this.lightTxs = {};
    this.receipts = {};
    this.blockNumber = 0;
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

  getBlockNumber = () => {
    let result = this.blockNumber;
    return result;
  }

  setBlockNumber = (value) => {
    this.blockNumber = value;
  }

  setLightTx = async (key, value) => {
    this.lightTxs[key] = value;
  }

  setReceipt = async (key, receiptJson, upload = false) => {
    this.receipts[key] = receiptJson;
    let address = '0x' + this._infinitechain.signer.getAddress();
    if (upload) {
      await this.syncer.uploadReceipt(address, receiptJson);
    }
  }
}

export default Memory;
