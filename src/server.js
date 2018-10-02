import axios from 'axios';
import types from '@/models/types';
import { AssertionError } from 'assert';

class Server {
  constructor (serverConfig, infinitechain) {
    this.serverConfig = serverConfig;
    this._infinitechain = infinitechain;
    this._web3Url = serverConfig.web3Url;
    this._nodeUrl = serverConfig.nodeUrl;
  }

  sendLightTx = async (lightTx) => {
    let gringotts = this._infinitechain.gringotts;
    let contract = this._infinitechain.contract;
    let verifier = this._infinitechain.verifier;
    let receipt = await gringotts.sendLightTx(lightTx);
    if (verifier.verifyReceipt(receipt) !== true) {
      throw new Error('Wrong signature when verify receipt received from booster.');
    }
    switch (receipt.type()) {
    case types.deposit:
      await contract.deposit(receipt);
      break;
    case types.withdrawal:
      await contract.proposeWithdrawal(receipt);
      break;
    case types.instantWithdrawal:
      await contract.instantWithdraw(receipt);
      break;
    case types.remittance:
      break;
    }
    return receipt;
  }

  attach = async (stageHeight = null, nonce = null) => {
    let gringotts = this._infinitechain.gringotts;
    let res = await gringotts.fetchRootHashes(stageHeight);

    if (res.data.ok) {
      let serializedTx = await this._infinitechain.contract.attach(
        res.data.trees.receiptRootHash,
        res.data.trees.accountRootHash,
        '',
        nonce
      );
      let attachRes = await gringotts.attach(serializedTx, res.data.stageHeight);
      return attachRes.data.txHash;
    } else {
      throw new Error(res.data.message);
    }
  }

  addServerMetadata = async (lightTx, serverMetadata) => {
    if (serverMetadata) {
      if (typeof serverMetadata == 'object') {
        serverMetadata = JSON.stringify(serverMetadata);
      } else {
        serverMetadata = serverMetadata.toString();
      }
      lightTx.metadata.server = serverMetadata;
    } else {
      lightTx.metadata.server = '';
    }
    return lightTx;
  }
  finalize = async (stageHeight) => {
    return this._infinitechain.booster.finalize(stageHeight);
  }

  defend = async (stageHeight, lightTxHash) => {
    let url = this._nodeUrl + '/slice';
    let res = await axios.get(url, {
      params: {
        stage_height: stageHeight, payment_hash: lightTxHash
      }
    });

    let slice = res.data.slice;
    slice = slice.map(h => h.treeNodeHash);
    let collidingLightTxHashes = res.data.lightTxHashArray;
    let treeNodeIndex = res.data.treeNodeIndex;

    return this._infinitechain.booster.exonerate(stageHeight, lightTxHash, treeNodeIndex, slice, collidingLightTxHashes);
  }

  compensate = async (stageHeight, lightTxHashes) => {
    return this._infinitechain.booster.payPenalty(stageHeight, lightTxHashes);
  }
}

export default Server;
