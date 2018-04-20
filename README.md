# Infinitechain Nodejs

This project is a package for the centralized service which can import it to utilize the infinitechain client and server function.

## Install
```
npm install infinitechain_nodejs
```
## Structure
IFCBuilder

IFC
- client
  - makeRawPayment
  - audit
  - takeObjection
  - verifyPayment
  - saveRawPayment
  - getRawPayment
  - savePayment
  - getPayment
  - export
- server
  - signRawPayment
  - sendPayments
  - commitPayments
  - exonerate
  - payPenalty
  - finalize
- crypto
 - getOrNewKeyPair
  - importSignerKey
  - importCipherKey
  - encrypt
  - decrypt
  - sign
  - verify
  - getSignerAddress
  - keyInfo
- sidechain
  - getIFCContract
  - getStage
  - getStageRootHash
  - getLatestStageHeight
  - getSlice
- event
  - watchAddNewStage
  - watchObjection
  - watchExonerate
  - watchFinalize

## Example
### 1. Use `InfinitechainBuilder` to create an infinitechain object
```javascript
let wizard = require('wizard_nodejs');
let InfinitechainBuilder = wizard.InfinitechainBuilder;
infinitechain = new InfinitechainBuilder()
  .setNodeUrl('http://0.0.0.0:3000')
  .setWeb3Url('http://0.0.0.0:8545')
  .setSignerKey('2058a2d1b99d534dc0ec3e71876e4bcb0843fd55637211627087d53985ab04aa')
  .setStorage('memory')
  .setClientAddress('')
  .setServerAddress('')
  .build();

let watchBlockchainEvent = async () => {
  await infinitechain.connect();
  infinitechain.event.onProposeDeposit((err, result) => {
    if (err) {
      console.error(err);
    }

    console.log(result);
  });
};

watchBlockchainEvent();
```
### 2. Use `crypto` to generate key pair or import your private key.
```javascript
ifc.crypto.getOrNewKeyPair()
ifc.crypto.keyInfo()
ifc.crypto.importSignerKey('YOUR_PRIVATE_KEY')
```
### 3. Make raw payment with specific format and save it.
When client wants to purchase a product, `makeRawPayment()` should be called to produce a raw payment. After that, client can call `saveRawPayment()` to save it and then send to server.
```javascript
rawPayment = ifc.client.makeRawPayment(value, data)
ifc.client.saveRawPayment(rawPayment)
/* 
rawPayment = {
  from: '0x49aabbbe9141fe7a80804bdf01473e250a3414cb',
  to: '0x5b9688b5719f608f1cb20fdc59626e717fbeaa9a',
  value: 100,
  localSequenceNumber: 99,
  stageHeight: 3,
  data: {
    foo: 'bar',
    pkClient: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5SxAR4lIyHg3vF/DbWKq\nZfedueCC6TpSMmD3LMZ2vhvI8cO1ydmDRTngJlgiKCcQFGGRcDqI5vxBfE4vdCy/\nDFw1zTiT9pPLUWGZNT4YxlcdFUJ26b4YqRHUk8Tfg4YNSUTaNKaj2VKj3NyLrchN\neunMWeLj+QlfdjV5zUkOy9pbMj0co1gDAK85jnO8NJupycWyA/ezfpaoTfJj2Ijd\n2b0+nCWCdWw8oWBJH9uXhCetbTI2QjYYOXj77aICrr2OUH4OkiZMoiIXAIV0D+P9\nysa6hgFzv5xAlO39mOnnu4wRoYJIIaHZyvNMVkdt4ZavZPuTuAQIPODy8/n19QWq\nRQIDAQAB\n-----END PUBLIC KEY-----',
    pkStakeholder: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAiQgP8iTDok0b1JSIPmbE\nzCKSphTfHm57Mu3LIgz9PD3vfcVW43sqAMOkelRijqmUpNLW0OBYzNIgH7sIIrhG\n89zXxXG/s4ewrbcbJn8XhotFoJQFLzBFovgYv34v3ZYmlCZsApWAtXkxWveq54FJ\nsQFrUWA+J/FNkp4uqu2Ekenn8OnuYYn25LdZPiUugOPMrALk4hS6nDSBmfVSPPka\nDilawdZwjkQGH9uu8pOFYG+oT1q9MYahrkmRzY05Q4zHOhB8HPzsbz0HpuwanXga\n/HqEmvBn0EJs+SrkZZmyZ6bjz1Izx8Io67HEje9JUeV6qDLE/ZQ/PXoRLnqg3Yqd\nIwIDAQAB\n-----END PUBLIC KEY-----'
  }
}
*/
console.log(rawPayment);
```
### 4. Make a valid `payment`
After server gets client's rawPayment, server should call `signRawPayment()` to produce the payment. Then server will send it back to client.
```javascript
payment = ifc.server.signRawPayment(rawPayment)
```
### 5. Send `payments` to Infinitechain Node and Client.
When server accumulates some payments, it can call `sendPayments()` to send them to Infinitechain node.
(Client should get payment to verify in step 6, you need to implement yourself or see the [example](https://github.com/TideiSunTaipei/infinitechain_nodejs_demo/blob/master/server.js#L21))
```javascript
ifc.server.sendPayments([payment1, payment2, payment3, ...])
```
### 6. Verify payment and save it.
After client receive a payment that included a server's signature, client should call `verifyPayment()` to verify the integrity of payment. If it is valid, client could call `savePayment()` to save it.
```javascript
ifc.client.verifyPayment(payment)
ifc.client.savePayment(payment)
```
### 7. Commit `payment`s to Blockchain
After sending payments, server can call `commitPayments()` to put these payments on blockchain.
```javascript
ifc.server.commitPayments(objectionTime, finalizeTime, data)
// data is a string variable that you can add any message you want like bitcoin's op_return.
```
### 8. Audit payment
After client is notified by a `AddNewStage event`, he can call `audit()` to audit the payments that are related to the event.
```javascript
ifc.client.audit(paymentHash)
```
### 9. Take objection
When a result of the distributed auditing is false, client can call `takeObjection()`.
```javascript
ifc.client.takeObjection(payment)
```
### 10. Exonerate `payment`
When server receives the objections from clients, it can exonerate to each objection payments.
```javascript
ifc.server.exonerate(stageHeight, paymentHash)
```
### 11. Pay Penalty `payments`
If server exonerates fail to some client's payment, it should pay penalty to these payments.
```javascript
ifc.server.payPenalty(stageHeight, [paymentHash1, paymentHash2, paymentHash3, ...])
```
### 12. Finalize `stage`
After processing these objection's payment, server can call `finalize()` to complete this stage.
```javascript
ifc.server.finalize(stageHeight)
```
