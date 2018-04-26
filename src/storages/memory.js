class Memory {
  constructor () {
    this.lightTxs = {};
    this.receipts = {};
  }

  getReceiptHashesByStageHeight = async (stageHeight) => {
    return Object.keys(this.data).map(key => {
      return this.data[key];
    }).filter(receipt => {
      return receipt.lightTxData.stageHeight == stageHeight;
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

  setReceipt = async (key, value) => {
    this.receipts[key] = value;
  }
}

export default Memory;
