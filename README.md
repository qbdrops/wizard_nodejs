# Infinitechain Nodejs

This project is a package for the centralized service which can import it to utilize the infinitechain server function.

## Install
```
npm install infinitechain_nodejs
```
## Structure
IFCBuilder

IFC
- server
  - signRawPayment
  - sendPayments
  - commitPayments
  - exonerate
  - payPenalty
  - finalize
- crypto
  - getNewKeyPair
  - keyInfo
  - encrypt
  - decrypt
  - sign
  - verify
- event
  - watchAddNewStage
  - watchObjection
  - watchExonerate
  - watchFinalize

## Example
### 1. Use `IFCBuilder` to create an ifc object
```javascript
var IFCBuilder = require('infinitechain_nodejs')
ifc = new IFCBuilder().setNodeUrl("http://0.0.0.0:3000").setWeb3Url("http://0.0.0.0:8545").build()
```

### 2. Use `crypto` to generate key pair or import your private key.
```javascript
ifc.crypto.getOrNewKeyPair()
ifc.crypto.keyInfo()
ifc.crypto.importSignerKey('YOUR_PRIVATE_KEY')
```

### 3. Make a valid `payment`
After server gets client's rawPayment, server should call `signRawPayment()` to produce the payment. Then server will send it back to client.
```javascript
payment = ifc.server.signRawPayment(rawPayment)
```

### 4. Send `payments` to Infinitechain Node
When server accumulates some payments, it can call `sendPayments()` to send them to Infinitechain node.
```javascript
ifc.server.sendPayments([payment1, payment2, payment3, ...])
```

### 5. Commit `payment`s to Blockchain
After sending payments, server can call `commitPayments()` to put these payments on blockchain.
```javascript
ifc.server.commitPayments(objectionTime, finalizeTime, data)
// data is a string variable that you can add any message you want like bitcoin's op_return.
```

### 6. Exonerate `payment`
When server receives the objections from clients, it can exonerate to each objection payments.
```javascript
ifc.server.exonerate(stageHeight, paymentHash)
```
### 7. Pay Penalty `payments`
If server exonerates fail to some client's payment, it should pay penalty to these payments.
```javascript
ifc.server.payPenalty(stageHeight, [paymentHash1, paymentHash2, paymentHash3, ...])
```
### 8. Finalize `stage`
After processing these objection's payment, server can call `finalize()` to complete this stage.
```javascript
ifc.server.finalize(stageHeight)
```
