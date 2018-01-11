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
ifc.crypto.generateKeyPair()
sig = ifc.crypto.sign('foo')
ifc.crypto.verify('foo', sig)
cipher = ifc.crypto.encrypt('foo')
ifc.crypto.decrypt(cipher)
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
