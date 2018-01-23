# IFC
## Structure
IFCBuilder

IFC
- server // Web3Url
  - signRawPayment
  - exonerate
  - sendPayments
  - commitPayments
  - finalize
  - payPenalty
- crypto
  - getNewKeyPair
  - keyInfo
  - encrypt
  - decrypt
  - sign
  - verify
- sidechain // Web3Url, NodeUrl
  - getIFCContract
- event // Web3Url
  - watchAddStage
  - watchObjection
  - watchExonerate
  - watchFinalize

## Example
### 1. Use `IFCBuilder` to create an ifc object
```javascript
ifc = new IFCBuilder().setNodeUrl("http://0.0.0.0:3000").setWeb3Url("http://0.0.0.0:8545").build()
```

### 2. Use `crypto` to generate key pair
```javascript
ifc.crypto.getOrNewKeyPair()
ifc.crypto.keyInfo()
ifc.crypto.importSignerKey('YOUR_PRIVATE_KEY')
```

### 3. Fake a `rawPayment` with specific format
```javascript
rawPayment = {
  from: '0x49aabbbe9141fe7a80804bdf01473e250a3414cb',
  to: '0x5b9688b5719f608f1cb20fdc59626e717fbeaa9a',
  value: 100,
  localSequenceNumber: 99,
  stageHeight: 3,
  data: {
    foo: 'bar',
    pkUser: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5SxAR4lIyHg3vF/DbWKq\nZfedueCC6TpSMmD3LMZ2vhvI8cO1ydmDRTngJlgiKCcQFGGRcDqI5vxBfE4vdCy/\nDFw1zTiT9pPLUWGZNT4YxlcdFUJ26b4YqRHUk8Tfg4YNSUTaNKaj2VKj3NyLrchN\neunMWeLj+QlfdjV5zUkOy9pbMj0co1gDAK85jnO8NJupycWyA/ezfpaoTfJj2Ijd\n2b0+nCWCdWw8oWBJH9uXhCetbTI2QjYYOXj77aICrr2OUH4OkiZMoiIXAIV0D+P9\nysa6hgFzv5xAlO39mOnnu4wRoYJIIaHZyvNMVkdt4ZavZPuTuAQIPODy8/n19QWq\nRQIDAQAB\n-----END PUBLIC KEY-----',
    pkStakeholder: '-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAiQgP8iTDok0b1JSIPmbE\nzCKSphTfHm57Mu3LIgz9PD3vfcVW43sqAMOkelRijqmUpNLW0OBYzNIgH7sIIrhG\n89zXxXG/s4ewrbcbJn8XhotFoJQFLzBFovgYv34v3ZYmlCZsApWAtXkxWveq54FJ\nsQFrUWA+J/FNkp4uqu2Ekenn8OnuYYn25LdZPiUugOPMrALk4hS6nDSBmfVSPPka\nDilawdZwjkQGH9uu8pOFYG+oT1q9MYahrkmRzY05Q4zHOhB8HPzsbz0HpuwanXga\n/HqEmvBn0EJs+SrkZZmyZ6bjz1Izx8Io67HEje9JUeV6qDLE/ZQ/PXoRLnqg3Yqd\nIwIDAQAB\n-----END PUBLIC KEY-----'
  }
}
```

### 4. Make a valid `payment`
```javascript
payment = ifc.server.signRawPayment(rawPayment)
```

### 5. Send `payment`s to Infinitechain Node
```javascript
ifc.server.sendPayments([payment])
```

### 6. Commit `payment`s to Blockchain
```javascript
ifc.server.commitPayments()
```

### 7. Finalize `stage`
```javascript
ifc.server.finalize(STAGE_HEIGHT)
```

### How to Develop
- `npm install`
- `npm run build`: 轉譯 & 打包
- `npm run console`: node REPL

### 從本機安裝 ifc
```
(/ifc)           cd ../ifc_extension
(/ifc_extension) npm install ../ifc
```
