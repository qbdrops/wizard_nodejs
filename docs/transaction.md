## Raw Transaction
- from
- to
- value
- localSequenceNumber
- stageHeight
- data

## Transaction Hash
```javascript
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

let cipherUser = encrypt_user(rawTransaction)
let cipherCP = encrypt_cp(rawTransaction)
let txHash = sha_3(cipherUser + cipherCP)
```

## Transaction
- stageHash
- stageHeight
- txHash
- cipherUser
- cipherCP
- r
- s
- v
- onChain

```javascript
{
    tx: {
        stageHeight: 3,
        stageHash: '0xc89efdaa54c0f20c7adf612882df0950f5a951637e0307cdcb4c672f298b8bc6',
        txHash: '0x6e7f1007bfb89f5af93fb9498fda2e9ca727166ccabd3a7109fa83e9d46d3f1a',
        cipherUser: 'blahblah',
        cipherCP: 'blahblah'
        v: 28,
        r: '0x384f9cb16fe9333e44b4ea8bba8cb4cb7cf910252e32014397c73aff5f94480c',
        s: '0x55305fc94b234c21d0025a8bce1fc20dbc7a83b48a66abc3cfbfdbc0a28c5709',
        onChain: false
    }
}
```

## How to apply hash function to json content?
  - Now use `Json.stringify`, will use bytearray encoding in the future