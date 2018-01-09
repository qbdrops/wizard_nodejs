const NodeRSA = require('node-rsa');
var constants = require('constants');

let encrypt = function(order, readPublicKey){
    return new Promise((resolve) => {
        let key = new NodeRSA(readPublicKey, {encryptionScheme:{scheme:'pkcs1', padding: constants.RSA_NO_PADDING}});
        let encrypted = key.encrypt(order, 'base64');
        resolve(encrypted);
    });  
};

module.exports = {
    encrypt: encrypt
};
