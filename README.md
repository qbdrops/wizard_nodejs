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
```
infinitechain.client.makeProposeDeposit ()
```
If client transfers ETH or ERC20 tokens to the Bolt contract, Bolt contract will execute proposeDeposit function automatically. After that, client can use the Bolt SDK to execute makeProposeDeposit function. This function will listen a proposeDeposit event. When this function has already listened the deposit event, it will make a deposit light transaction. At last, client will get the light transaction and send it to server.
##### Parameter
`None`
##### Return
`object: light transaction`

#### infinitechain.client.makeProposeWithdrawal
```
infinitechain.client.makeProposeWithdrawal (withdrawValue)
```
Client can use this function to make a withdrawal light transaction and send it to server.
##### Parameter
`1. integer: withdraw value`
##### Return
`object: lightTx`
#### infinitechain.client.makeLightTx
```
let type = 'deposit'
let lightTxData = {
      from: '0x123',
      to: '0x456',
      value: 0.1,
      nonce: 1,
      assetID: 1,
      logID: 1,
      fee: '0.01'
    }
let metadata = {
    foo: 'bar'
}

infinitechain.client.makeLightTx (type, lightTxData, metadata)
```
This function is called by makeProposeDeposit and makeProposeWithdrawal function. It could be used to make different type of light transaction, like deposit, withdraw, instantWithdraw and remittance.
##### Parameter
`1. string: light transaction type`
`2. object: light transaction data`
`3. object: metadata`

##### Return
`object: light transaction`
#### infinitechain.client.saveLightTx
```
infinitechain.client.saveLightTx (lightTransaction)
```
This function is used to save the json format of light transaction.
##### Parameter
`1. object: light transaction`
##### Return
`None`
#### infinitechain.client.saveReceipt
```
infinitechain.client.saveReceipt (receipt)
```
This function is used to save the json format of receipt.
##### Parameter
`1. object: receipt`

##### Return
`None`
#### infinitechain.client.getLightTx
```
infinitechain.client.getLightTx (lightTxHash)
```
This function is used to get the json format of light transaction according to light transaction hash.
##### Parameter
`1. string: light transaction hash`
##### Return
`object: light transaction`
#### infinitechain.client.getReceipt
```
infinitechain.client.getReceipt (receiptHash)
```
This function is used to get the json format of receipt according to receipt hash.
##### Parameter
`1. string: receipt hash`
##### Return
`object: receipt`
#### infinitechain.client.getAllReceiptHashes
```
infinitechain.client.getAllReceiptHashes (stageHeight)
```
This function is used to get all receipt hashes of stage height.
##### Parameter
`1. integer: stage height`
##### Return
`array: receipts`
### Server
#### infinitechain.server.sendLightTx
```
infinitechain.server.sendLightTx (lightTransaction)
```
Server can use this function to send the light transaction to gringotts and wait the gringotts send back the receipt.
##### Parameter
`1. object: light transaction`
##### Return
`object: receipt`
#### infinitechain.server.attach
```
infinitechain.server.attach ()
```
If server wants to put the receipts to the main chain, it can use this function to send a request to notify gringotts. After that, gringotts will use the receipts to compute two root hashes and send them back to server. At last, server will call the attach funtion in order to add a new stage and include the two root hashes on Bolt contract.
##### Parameter
`None`
##### Return
`string: transaction hash`
#### infinitechain.server.finalize ()
#### infinitechain.server.defend ()

### Signer
#### infinitechain.signer.signWithServerKey
```
infinitechain.signer.signWithServerKey (json object)
```
Server can use this function to sign the light transaction or receipt.
##### Parameter
`1. object: light transaction or receipt`
##### Return
`object: signedLightTransaction or signedReceipt`
#### infinitechain.signer.signWithClientKey
```
infinitechain.signer.signWithClientKey (light transaction)
```
Client can use this function to sign the light transaction.
##### Parameter
`1. object: light transaction`
##### Return
`object: signedLightTransaction`
### Verifier
#### infinitechain.signer.verifyLightTx
```
infinitechain.signer.verifyLightTx (light transaction)
```
This funtion is used to verify the light transaction which format is correct or not.
##### Parameter
`1. object: light transaction`
##### Return
`boolean: isValid`
#### infinitechain.signer.verifyReceipt
```
```
This funtion is used to verify the receipt which format is correct or not.
##### Parameter
`1. object: receipt`
##### Return
`boolean: isValid`
## Event
#### infinitechain.signer.onProposeDeposit
```
infinitechain.event.onProposeDeposit(async (err, result) => {
        console.log(result)
      });
```
Listen the proposeDeposit event.
##### Parameter
`None`
##### Return
`object: result`
#### infinitechain.signer.onDeposit
```
infinitechain.event.onDeposit(async (err, result) => {
        console.log(result)
      });
```
Listen the deposit event.
##### Parameter
`None`
##### Return
`object: result`
#### infinitechain.signer.onProposeWithdrawal
```
infinitechain.event.onProposeWiothdrawal(async (err, result) => {
        console.log(result)
      });
```
Listen the proposeWithdrawal event.
##### Parameter
`None`
##### Return
`object: result`
#### infinitechain.signer.onInstantWithdraw
```
infinitechain.event.onInstantWithdraw(async (err, result) => {
        console.log(result)
      });
```
Listen the instantWithdraw event.
##### Parameter
`None`
##### Return
`object: result`
#### infinitechain.signer.onAttach
```
infinitechain.event.onAttach(async (err, result) => {
        console.log(result)
      });
```
Listen the attach event.
##### Parameter
`None`
##### Return
`object: result`
#### infinitechain.signer.onChallenge
#### infinitechain.signer.onDefend
#### infinitechain.signer.onFinalize
