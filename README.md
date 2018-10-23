# Wizard Nodejs

This project is a package for the centralized service to utilize the BOLT client and server function.

## Install
```
npm install wizard_nodejs
```

### How to Start
```javascript
{infinitechain = new wizard.InfinitechainBuilder()
  .setNodeUrl('http://0.0.0.0:3000')
  .setWeb3Url('ws://0.0.0.0:8546')
  .setSignerKey('22b8af6522a7cf410b54eb8be2969c2ee20d30e89a1a2dc5476a8cccc1be8592')
  .setStorage('memory')
  .build();
infinitechain.initialize()
}
```

## Functions
### Client
#### infinitechain.client.makeProposeDeposit
```
infinitechain.client.makeProposeDeposit()
```
If client transfers ETH or ERC20 tokens to the Bolt contract, Bolt contract will execute proposeDeposit function automatically. After that, client can use the Bolt SDK to execute makeProposeDeposit function. This function will listen a proposeDeposit event. When this function has already listened the deposit event, it will make a deposit light transaction. At last, client will get the light transaction and send it to server.
##### Parameter
`None`
##### Return
`light transaction` - `object`

#### infinitechain.client.makeProposeWithdrawal
```
infinitechain.client.makeProposeWithdrawal(withdrawValue)
```
Client can use this function to make a withdrawal and send it to server.
##### Parameter
1. `withdraw value` - `integer`: The value of ether or tokens that you want to withdraw.
##### Return
`lightTx` - `object`
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

infinitechain.client.makeLightTx(type, lightTxData, metadata)
```
This function is called by makeProposeDeposit and makeProposeWithdrawal function. It could be used to make different types of light transactions, like deposit, withdraw, instantWithdraw and remittance.
##### Parameter
1. `light transaction type` - `string`: The type of light transaction, included deposit, instantWithdraw, withdraw or remittance.
2. `light transaction data` - `object`: The important information of a light trnasaction.
3. `metadata` - `object`: The additional information of a light trnasaction.

##### Return
`light transaction` - `object`
#### infinitechain.client.saveLightTx
```
infinitechain.client.saveLightTx(lightTransaction)
```
This function is used to save the json format of light transaction.
##### Parameter
1. `light transaction` - `object`: The json format of light transaction that you want to store.
##### Return
`None`
#### infinitechain.client.saveReceipt
```
infinitechain.client.saveReceipt(receipt)
```
This function is used to save the json format of receipt.
##### Parameter
1. `receipt` - `object`: The json format of receipt that you want to store.

##### Return
`None`
#### infinitechain.client.getLightTx
```
infinitechain.client.getLightTx(lightTxHash)
```
This function is used to get the json format of light transaction according to light transaction hash.
##### Parameter
1. `light transaction hash` - `string`: The hash value of a light transaction that you want to get.
##### Return
`light transaction` - `object`
#### infinitechain.client.getReceipt
```
infinitechain.client.getReceipt(receiptHash)
```
This function is used to get the json format of receipt according to receipt hash.
##### Parameter
1. `receipt hash` - `string`: The hash value of a receipt that you want to get.
##### Return
`receipt` - `object`
#### infinitechain.client.getAllReceiptHashes
```
infinitechain.client.getAllReceiptHashes(stageHeight)
```
This function is used to get all receipt hashes of stage height.
##### Parameter
1. `stage height` - `integer`: The height of stage that you want to get the mapping receipts.
##### Return
`receipts` - `array`
### Server
#### infinitechain.server.sendLightTx
```
infinitechain.server.sendLightTx(lightTransaction)
```
Server can use this function to send the light transaction to gringotts and wait the gringotts send back the receipt.
##### Parameter
1. `light transaction` - `object`: The light transaction which received from client.
##### Return
`receipt` - `object`
#### infinitechain.server.finalize ()
#### infinitechain.server.defend ()

### Signer
#### infinitechain.signer.signWithServerKey
```
infinitechain.signer.signWithServerKey(json object)
```
Server can use this function to sign the light transaction or receipt.
##### Parameter
1. `light transaction or receipt` - `object`: The light transaction or receipt that you want to sign.
##### Return
`signedLightTransaction or signedReceipt` - `object`
#### infinitechain.signer.signWithClientKey
```
infinitechain.signer.signWithClientKey(light transaction)
```
Client can use this function to sign the light transaction.
##### Parameter
1. `light transaction` - `object`: The light transaction that you want to sign.
##### Return
`signedLightTransaction` - `object`
### Verifier
#### infinitechain.verifier.verifyLightTx
```
infinitechain.verifier.verifyLightTx(light transaction)
```
This funtion is used to verify the light transaction which format is correct or not.
##### Parameter
1. `light transaction` - `object`: The light transaction which you want to verify.
##### Return
`isValid` - `boolean`
#### infinitechain.verifier.verifyReceipt
```
infinitechain.verifier.verifyReceipt(receipt)
```
This funtion is used to verify the receipt which format is correct or not.
##### Parameter
1. `receipt` - `object`: The receipt which you want to verify.
##### Return
`isValid` - `boolean`
## Event
#### infinitechain.event.onProposeDeposit
```
infinitechain.event.onProposeDeposit(async (err, result) => {
    console.log(result)
});
```
Listen the proposeDeposit event.
##### Parameter
`None`
##### Return
`result` - `object`
#### infinitechain.event.onDeposit
```
infinitechain.event.onDeposit(async (err, result) => {
    console.log(result)
});
```
Listen the deposit event.
##### Parameter
`None`
##### Return
`result - object`
#### infinitechain.event.onProposeWithdrawal
```
infinitechain.event.onProposeWiothdrawal(async (err, result) => {
    console.log(result)
});
```
Listen the proposeWithdrawal event.
##### Parameter
`None`
##### Return
`result` - `object`
#### infinitechain.event.onInstantWithdraw
```
infinitechain.event.onInstantWithdraw(async (err, result) => {
    console.log(result)
});
```
Listen the instantWithdraw event.
##### Parameter
`None`
##### Return
`result` - `object`
#### infinitechain.event.onAttach
```
infinitechain.event.onAttach(async (err, result) => {
    console.log(result)
});
```
Listen the attach event.
##### Parameter
`None`
##### Return
`result` - `object`
#### infinitechain.event.onChallenge
#### infinitechain.event.onDefend
#### infinitechain.event.onFinalize
