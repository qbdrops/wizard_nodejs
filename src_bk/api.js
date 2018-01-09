import request from 'superagent';

class API {
    constructor() {
        this._env = {};
    }

    set env(v) {
        this._env = v;
    }

    registerRSAPublickey (publickey) {
      let url = this._env.domain + '/rsa/publickey';
      return request
      .put(url)
      .type('form')
      .send({
        publickey: publickey
      })
    }
  
    registerEthereumPublickey (publickey) {
      let url = this._env.domain + '/ecc/publickey';
      return request
      .put(url)
      .type('form')
      .send({
        publickey: publickey
      })
    }
  
    sendOrder (message) {
      let url = this._env.domain + '/finish';
      return request
      .post(url)
      .type('form')
      .send({
        content: message
      })
    }
  
    async getSlice (proofMsg,signedProofMsg,userPubKey,tid,scid) {
      let url = this._env.domain + '/slice';
      return request
      .get(url)
      .query({msg:proofMsg,signature:signedProofMsg,publicKey:userPubKey,tid:tid,scid:scid});
    }
}

let api = new API();
export default api;
