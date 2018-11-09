class Memory {
  constructor () {
    this.db = {};
    this.blockNumber = 0;
  }

  setInfinitechain (infinitechain) {
    this._infinitechain = infinitechain;
  }

  setReceiptSyncer (syncer) {
    this.syncer = syncer;
  }

  getReceiptHashesByStageHeight = async (stageHeight) => {
    let receiptHashes = this.db['receiptHashes:' + parseInt(stageHeight)];
    if (!receiptHashes) receiptHashes = [];
    return receiptHashes;
  }

  getReceipt = async (receiptHash) => {
    let receipt = this.db['receipt:' + receiptHash];
    return receipt;
  }

  getBlockNumber = () => {
    let blockNumber = this.blockNumber;
    return blockNumber;
  }

  setBlockNumber = (value) => {
    this.blockNumber = value;
  }

  setReceipt = async (receiptHash, receiptJson, upload = false) => {
    try {
      this.db['receipt:' + receiptHash] = receiptJson;
      await this._appendReceiptHash(parseInt(receiptJson.receiptData.stageHeight, 16), receiptJson.receiptHash);
    } catch (e) {
      throw e;
    }
  }

  _appendReceiptHash = async (stageHeight, receiptHash) => {
    let receiptHashes = await this.getReceiptHashesByStageHeight(stageHeight);
    receiptHashes.push(receiptHash);
    this.db['receiptHashes:' + parseInt(stageHeight)] = receiptHashes;
  }
}

export default Memory;
