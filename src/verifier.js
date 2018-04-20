import EthUtils from 'ethereumjs-util';
import assert from 'assert';
import LightTransaction from '@/models/light-transaction';
import types from '@/models/types';

class Verifier {
  constructor (verifierConfig, infinitechain) {
    this.verifierConfig = verifierConfig;
    this._infinitechain = infinitechain;
    this._serverAddress = null;
  }

  fetchServerAddress = async () => {
    let res = await this._infinitechain.gringotts.fetchServerAddress();
    this._serverAddress = res.data.address;
  }

  verifyLightTx = (lightTx) => {
    assert(lightTx instanceof LightTransaction, 'Parameter \'lightTx\' is not a LightTransaction instance.');
    let isValid;
    switch (lightTx.type()) {
    case types.deposit: {
      let clientAddress = lightTx.lightTxData.to.slice(-40);
      let serverAddress = this._serverAddress;
      let isClientSigValid = true;
      let isServerSigValid = true;

      if (lightTx.hasClientLightTxSig()) {
        isClientSigValid = (clientAddress == this._recover(lightTx.lightTxHash, lightTx.sig.clientLightTx));
      }

      if (lightTx.hasServerLightTxSig()) {
        isServerSigValid = (serverAddress == this._recover(lightTx.lightTxHash, lightTx.sig.serverLightTx));
      }

      isValid = (isClientSigValid && isServerSigValid);
      break;
    }
    case types.withdrawal:
      break;
    case types.instantWithdrawal:
      break;
    case types.remittance:
      break;
    }
    return isValid;
  }

  _recover = (msgHash, signature) => {
    let prefix = new Buffer('\x19Ethereum Signed Message:\n');
    let ethMsgHash = EthUtils.sha3(Buffer.concat([prefix, new Buffer(String(msgHash.length)), Buffer.from(msgHash)]));
    let publicKey = EthUtils.ecrecover(ethMsgHash, signature.v, signature.r, signature.s);
    let address = EthUtils.pubToAddress(publicKey).toString('hex');
    return address;
  }
}

export default Verifier;
