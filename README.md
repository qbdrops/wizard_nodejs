# IFC
## Structure
IFCBuilder

IFC
- server // Web3Url
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
- sidechain // Web3Url, NodeUrl
  - getIFCContract
  - addNewStage
- event // Web3Url
  - watchAddNewStage
  - watchObjection
  - watchExonerate
  - watchFinalize

## Example
### 1. Use `IFCBuilder` to create an ifc object
```javascript
ifc = new IFCBuilder().setNodeUrl("http://0.0.0.0:3000").setWeb3Url("http://0.0.0.0:8545").build()
```

### 2. Use `crypto` to generate key pair and you can also import your private key.
```javascript
ifc.crypto.getOrNewKeyPair()
ifc.crypto.keyInfo()
ifc.crypto.importSignerKey('YOUR_PRIVATE_KEY')
```

### 3. Make a valid `payment`
After server get the client's rawPayment, server should call `signRawPayment()` to produce the payment. Then server will send back a payment to client and store it in server's database. 
```javascript
payment = ifc.server.signRawPayment(rawPayment)
```

### 4. Send `payments` to Infinitechain Node
When server accumulates some transactions and wants to put on blockchain, he can call `sendPayments()` to send them to Infinitechain node in order to  prepare for commit payments. 
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
When server receives the objections from clients, he can exonerate to each objection payments.
```javascript
ifc.server.exonerate(stageHeight, paymentHash)
```
### 7. Pay Penalty `payments`
If server exonerates fail to some client's payment, he should pay penalty to these payments. 
```javascript
ifc.server.payPenalty(stageHeight, [paymentHash1, paymentHash2, paymentHash3, ...])
```
### 8. Finalize `stage`
After processing these objection's payment, server can call `finalize()` to complete this stage. 
```javascript
ifc.server.finalize(stageHeight)
```

### How to Develop
- `npm install`
- `npm run build`
- `npm run console`: node REPL

### Install ifc in local
```
(/ifc)           cd ../ifc_extension
(/ifc_extension) npm install ../ifc
```
