import EthUtils from 'ethereumjs-util';
import TransactionStore from '@/stores/transaction-store';
import assert from 'assert';

class Client {
  constructor (clientConfig, ifc) {
    this.clientConfig = clientConfig;
    this.ifc = ifc;
    this._transactionStore = new TransactionStore();
  }

  makeRawTransaction = async (value, data) => {
    assert(data.pkUser, 'Parameter \'data\' does not include key \'pkUser\'');
    assert(data.pkStakeholder, 'Parameter \'data\' does not include key \'pkStakeholder\'');

    let lastestStageHeight = await this.ifc.sidechain.getLastestStageHeight();
    let newStageHeight = parseInt(lastestStageHeight) + 1;

    return {
      from: this.clientConfig.clientAddress,
      to: this.clientConfig.serverAddress,
      value: value,
      localSequenceNumber: 0,
      stageHeight: newStageHeight,
      data: data
    };
  }

  audit = async (txHash) => {
    try {
      let sidechain = this.ifc.sidechain;

      // Get transaction from storage
      let tx = this.getTransaction(txHash);

      // 1. Get slice and compute root hash
      let body = await sidechain.getSlice(tx.stageHeight, txHash);
      let slice = body.slice;
      let txHashArray = body.txHashArray;
      var localStageRootHash = '';
      if(txHashArray.includes(txHash)) {
        localStageRootHash = this._computeRootHashFromSlice(slice);
      }

      // 2. Get root hash from blockchain
      let stageHash = tx.stageHash;
      let stageRootHash = sidechain.getStageRootHash(stageHash);

      // 3. Compare
      return (localStageRootHash == stageRootHash);
    } catch (e) {
      console.error(e);
    }
  }

  takeObjection () {

  }

  putTransaction () { // local storage

  }

  finalize () {

  }

  getTransaction (txHash) {
    return {};
  }

  _getTxCipherHash (contentCipherUser, contentCipherCp) {
    return this._sha3(contentCipherUser.concat(contentCipherCp));
  }

  _sha3 (content) {
    return EthUtils.sha3(content).toString('hex');
  }

  _computeRootHashFromSlice (slice) {
    let firstNode = slice.shift();

    let rootNode = slice.reduce((acc, curr) => {
      if(acc.treeNodeID % 2 == 0) {
        acc.treeNodeHash = this._sha3(acc.treeNodeHash.concat(curr.treeNodeHash));
      } else {
        acc.treeNodeHash = this._sha3(curr.treeNodeHash.concat(acc.treeNodeHash));
      }
      acc.treeNodeID = parseInt(acc.treeNodeID / 2);
      return acc;
    }, firstNode);

    return rootNode.treeNodeHash;
  }
}

export default Client;
