# Wizard Nodejs

This project is a package for the centralized service to utilize the BOLT client and server function.

## Install
```
npm install wizard_nodejs
```

### How to Start
```javascript
let wizard = require('wizard_nodejs');
let infinitechain = new wizard.InfinitechainBuilder()
  .setNodeUrl('http://0.0.0.0:3000')
  .setWeb3Url('http://0.0.0.0:8545')
  .setSignerKey('41b1a0649752af1b28b3dc29a1556eee781e4a4c3a1f7f53f90fa834de098c4d')
  .setStorage('memory')
  .build();

infinitechain.initialize().then(() => {
  infinitechain.event.onProposeDeposit((err, r) => {
    console.log('deposit: ')
    console.log(r)
  });

  infinitechain.event.onProposeWithdrawal((err, r) => {
    console.log('withdrawal: ')
    console.log(r)
  });
});
```

## Functions
### Client
#### infinitechain.client.makeProposeDeposit
#### infinitechain.client.makeProposeWithdrawal
#### infinitechain.client.makeLightTx
#### infinitechain.client.saveLightTx
#### infinitechain.client.saveReceipt
#### infinitechain.client.getLightTx
#### infinitechain.client.getReceipt
#### infinitechain.client.getAllReceiptHashes

### Server
#### infinitechain.server.sendLightTx
#### infinitechain.server.attach
#### infinitechain.server.finalize
#### infinitechain.server.defend

### Signer
#### infinitechain.signer.signWithServerKey
#### infinitechain.signer.signWithClientKey

### Verifier
#### infinitechain.signer.verifyLightTx
#### infinitechain.signer.verifyReceipt

## Event
#### infinitechain.signer.onProposeDeposit
#### infinitechain.signer.onDeposit
#### infinitechain.signer.onProposeWithdrawal
#### infinitechain.signer.onInstantWithdraw
#### infinitechain.signer.onAttach
#### infinitechain.signer.onChallenge
#### infinitechain.signer.onDefend
#### infinitechain.signer.onFinalize
```
