import EthUtils from 'ethereumjs-util';

class Server {
  constructor (serverConfig, ifc) {
    this.serverConfig = serverConfig;
    this.ifc = ifc;
  }

  makeTransaction = async (rawTx) => {
    let stageHash = this._sha3(rawTx.stageHeight.toString());

    let txHashAndCiphers = this._computeTxHashAndCiphers(rawTx);
    let txHash = txHashAndCiphers.txHash;
    let ciphers = txHashAndCiphers.ciphers;

    let message = stageHash + txHash;
    let signature = this._signTx(message);

    return {
      stageHeight: rawTx.stageHeight,
      stageHash: stageHash,
      txHash: txHash,
      cipherUser: ciphers.cipherUser,
      cipherCP: ciphers.cipherCP,
      v: signature.v,
      r: signature.r.toString('hex'),
      s: signature.s.toString('hex'),
      onChain: false
    };
  }

  exonerate () {

  }

  finalize () {

  }

  sendTransactions = async (txs) => {
    let sidechain = this.ifc.sidechain;
    return await sidechain.sendTransactions(txs);
  }

  commitTransactions = async () => {
    let sidechain = this.ifc.sidechain;
    return sidechain.commitTransations();
  }

  _sha3 (content) {
    return EthUtils.sha3(content).toString('hex');
  }

  _computeTxHashAndCiphers = async (rawTx) => {
    let crypto = this.ifc.crypto;
    let serializedRawTx = Buffer.from(JSON.stringify(rawTx)).toString('hex');
    let cipherUser = await crypto.encrypt(serializedRawTx, rawTx.data.pkUser);
    let cipherCP = await crypto.encrypt(serializedRawTx, rawTx.data.pkStakeholder);
    let txHash = this._sha3(cipherUser + cipherCP);
    return {
      txHash: txHash,
      ciphers: {
        cipherUser: cipherUser,
        cipherCP: cipherCP,
      }
    };
  }

  _signTx (message) {
    let crypto = this.ifc.crypto;
    let msgHash = this._sha3(message);
    let prefix = new Buffer('\x19Ethereum Signed Message:\n');
    let ethMsgHash = this._sha3(Buffer.concat([prefix, new Buffer(String(msgHash.length)), msgHash]));
    return crypto.sign(ethMsgHash);
  }
}

export default Server;
