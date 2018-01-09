import Cipher from '@/cryptos/cipher';
import Signer from '@/cryptos/signer';
// import ChromeExtensionStorage from '@/storages/chrome-extension';

class KeyStore {
  constructor () {
    this._cipher = new Cipher();
    this._signer = new Signer();
  }

  generateKeyPair = async () => {
    await this._signer.generateKeyPair();
    await this._cipher.generateKeyPair();
  }
}

export default KeyStore;
