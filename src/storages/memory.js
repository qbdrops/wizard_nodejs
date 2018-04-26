class Memory {
  constructor () {
    this.data = {};
  }

  getReceiptHashesByStageHeight = async (stageHeight) => {
    return Object.keys(this.data).map(key => {
      return this.data[key];
    }).filter(receipt => {
      return receipt.lightTxData.stageHeight == stageHeight;
    }).map(receipt => receipt.receiptHash);
  }

  get = async (key) => {
    let result = this.data[key];
    return result;
  }

  set = async (key, value) => {
    this.data[key] = value;
  }
}

export default Memory;
