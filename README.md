# IFC
## Structure
IFCBuilder

IFC
- client // Web3Url, NodeUrl, Storage
  - makeRawTransaction
  - audit
  - takeObjection
  - putTransaction
  - finalize
- server // Web3Url
  - makeTransaction
  - exonerate
  - sendTransactions
  - commitTransactions
  - finalize
- crypto
  - generateKeyPair
  - getKeyPairs
  - encrypt
  - decrypt
  - sign
  - verify
- sidechain // Web3Url, NodeUrl
  - pendingStages
  - pendingTransactions
  - getIFCContract
  - getStage
  - getTransaction
  - getSlice
- event // Web3Url
  - watchAddStage
  - watchObjection
  - watchExonerate
  - watchFinalize

## Example
```javascript
// Use IFCBuilder to create an ifc object
ifc = new IFCBuilder().setStorage("/path").setNodeUrl("http://0.0.0.0:3000").setWeb3Url("http://0.0.0.0:8545").build()

// Crypto
ifc.crypto.getOrNewKeyPair()
ifc.crypto.keyInfo()
ifc.crypto.importSignerKey('2af10f5713dd24bcdbf117024eb1506ff52b7084a392a30169790713add35ede')

rawTransaction = {
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

tx = ifc.server.signTransaction(rawTransaction)
ifc.server.sendTransactions([tx])

```

尚未加
JSON description (標準，agent公告後，用戶follow)
transaction format (資料結構定義)
包含salt 在訂單中

名詞: rootHash, IndexedMerkelTree

合約、transaction version

## Functions
### IFCBuilder
- setStorage(storage: Storage) (return IFCBuilder)
  - 設定Storage
- setContract(address: String, version: String) (return IFCBuilder)
  - 設定IFC合約地址 
- setDomainUrl(url: String) (return IFCBuilder)
  - 設定agent service domain位址
- setWeb3Url(url: String) (return IFCBuilder)
  - 設定web3 url
- importPrivateKey(key: String) (return IFCBuilder)
  - 匯入私鑰
- build() (return IFC)
  - 產生IFC實體

> IFCBuilder builds IFC object, which has `client` and `admin` module

```
ReactNativeStorage extends Storage
LocalStorage extends Storage
ChromeExtensionStorage extends Storage
```
### Storage
- clear() (return null)
  - 清空所有交易紀錄、金鑰 
- getAll() (return transactions[])
  - 取得所有存於本機交易
- saveTransaction
  - 儲存交易到本機

### Crypto
- RSA
 - generateKey() (return RSAKeyPair{})
 - encrypt(bytes[] data, string publicKey, string exportType("Hex" or "Base64")) (return string: cipher)
 - decrypt(bytes[] data, string privateKey) (return string: message)
- ECC
 - generateKey() (return ECCKeyPair{})
 - sign(bytes[] data, string privateKey) (return string: signature)
   - 返回 v, r, s 簽章
 - verify(bytes[] data, bytes32 msgHash) (return string: address)
   - 返回地址

### Client
- audit(scTxHash)
  - 稽核SideChain區塊中的transaction內容，回傳bool
- takeObjection (delagate to `ContractService.takeObjection`)

### Server
- exonerate (delegate to `ContractService.exonerate`)
- judge (delegate to `ContractService.judge`)
- submitProof (delegate to `ContractService.submitProof`)
- sendTransactions(transactions[])
  - 批次傳送transactions至側鏈節點之transaction pool，回傳bool 
- commitTransactions()
  - 對批次transactions做打包後，等待在主鏈上形成finality，回傳bool

### How to Develop
- `npm install`
- `npm run build`: 轉譯 & 打包
- `npm run console`: node REPL

### 從本機安裝 ifc
```
(/ifc)           cd ../ifc_extension
(/ifc_extension) npm install ../ifc
```
