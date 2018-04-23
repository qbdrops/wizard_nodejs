# Infinitechain Nodejs

This project is a package for the centralized service which can import it to utilize the infinitechain client and server function.

## Install
```
npm install wizard_nodejs
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
- signer
 - getOrNewKeyPair
  - importSignerKey
  - sign
  - getSignerAddress
- verifier
- contract
- gringotts
- event
  - watchAddNewStage
  - watchObjection
  - watchExonerate
  - watchFinalize

## Example
### Use `InfinitechainBuilder` to create an infinitechain object
```javascript
{
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
}
```
