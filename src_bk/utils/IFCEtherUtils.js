import Web3 from 'web3';
import Wallet from 'ethereumjs-wallet';
import ethUtils from 'ethereumjs-util';
import EthereumTx from 'ethereumjs-tx';
import ifcJSON from '@/abi/IFC.js';
import sideChainJSON from '@/abi/SideChainBlock.js';

let _web3 = null;
let _ifcObj = {};
let _sideChainObjList = [];
let _sideChainWatchList = [];

class IFCEtherUtils {
    constructor() {
        this._keyStore = {};
        this._env = {};
    }
    
    set keyStore(s) {
        this._keyStore = s;
    }

    set env(v) {
        this._env = v;
    }

    async checkRootHash (scidHash,rootHashByClient) {
        try {
            let sideChainObj = await this._newOrGetSideChainObj(scidHash);
            return '0x'+rootHashByClient == sideChainObj.contract.sideChainRootHash();
        } catch (err){
            return false;
        }
    }

    async takeObjection (orignObj) {
        console.log('takeObjection orignObj', orignObj);
        let web3 = await this._newOrGetWeb3();
        let eccpPrivateKey = await this._keyStore.getOrNewEthereumPrivateKey();
        let eccpPublicKey = this._keyStore.privateToPublic(eccpPrivateKey);
        let eccAddress = this._keyStore.privateToAddress(eccpPrivateKey);
        let sideChainObj = await this._newOrGetSideChainObj(orignObj.scidHash);
        let txMethodData = sideChainObj.contract.takeObjection.getData(
            orignObj.tidHash,
            orignObj.scidHash,
            orignObj.contentHash,
            orignObj.v,
            orignObj.r,
            orignObj.s,
            {from: eccAddress}
        );
        let newNonce = web3.toHex(web3.eth.getTransactionCount(eccAddress));
        const txParams = {
            nonce: newNonce,
            gas: 4700000,
            from: eccAddress,
            to: sideChainObj.addr,
            data: txMethodData
        };
        const tx = new EthereumTx(txParams);
        const eccpPrivateKeyWithout0x = eccpPrivateKey.substring(2);
        tx.sign(Buffer.from(eccpPrivateKeyWithout0x,'hex'));
        const serializedTx = tx.serialize();
        let txHash = await web3.eth.sendRawTransaction('0x' + serializedTx.toString('hex'));

        return txHash;
    }


    async getBlockAddress(scidHash) {
        let web3 = await this._newOrGetWeb3();
        let ifcObj = await this._newOrGetIFCObj();
        let address = await ifcObj.contract.getBlockAddress(scidHash);
        return address;
    }

    async isSideContractDeployed(scidHash) {
        let web3 = await this._newOrGetWeb3();
        let ifcObj = await this._newOrGetIFCObj();
        let address = await ifcObj.contract.getBlockAddress(scidHash);
        if(address == '0x0000000000000000000000000000000000000000') {
            return false;
        }

        return true;
    }


    async watchSideChainEvent(eventSource) {
        let opt = eventSource.opt;
        let scidHash = eventSource.scidHash;
        let handleEvent = eventSource.handleEvent;

        if(_sideChainWatchList[scidHash] == 'watching') {
            return;
        }
        console.log('watch event scidHash', scidHash);

        let web3 = await this._newOrGetWeb3();
        let SideChainClass = web3.eth.contract(sideChainJSON.abi);
        let sidechainAddr = await this.getSideChainAddress(scidHash);
        let sideChain = SideChainClass.at(sidechainAddr);

        sideChain.SideChainEvent(opt).watch(handleEvent);

        _sideChainWatchList[scidHash] = 'watching';
    }

    /*
        * Singleton for _web3
        */
    async _newOrGetWeb3() {
        if(_web3 != null && _web3.isConnected()) {
            return _web3; 
        }

        _web3 = new Web3(new Web3.providers.HttpProvider(this._env.web3Url));
        var coinbase = _web3.eth.coinbase;
        return _web3;
    }

    /*
        * Singleton for _ifcObj
        */
    async _newOrGetIFCObj() {
        let web3 = await this._newOrGetWeb3();

        if(_ifcObj.contract) {
            return _ifcObj;
        }

        _ifcObj.abi = ifcJSON.abi;
        _ifcObj.contractClass = web3.eth.contract(_ifcObj.abi);
        _ifcObj.contract = _ifcObj.contractClass.at(this._env.IFCContractAddress);
        return _ifcObj;
    }

    /*
        * Singleton for _sideChainObjList[scidHash]
        */
    async _newOrGetSideChainObj(scidHash) {
        let web3 = await this._newOrGetWeb3();
        let ifcObj = await this._newOrGetIFCObj();

        if(_sideChainObjList[scidHash]) {
            return _sideChainObjList[scidHash];
        }
   
        let sideChainObj = {};
        sideChainObj.addr = await ifcObj.contract.getBlockAddress(scidHash);
        console.log('sideChainObj.addr',sideChainObj.addr);  
        if(sideChainObj.addr == '0x0000000000000000000000000000000000000000') {
            throw new Error('Got 0x0000000000000000000000000000000000000000 address');
        }

        sideChainObj.abi = sideChainJSON.abi;
        sideChainObj.contractClass = web3.eth.contract(sideChainObj.abi);
        sideChainObj.contract = sideChainObj.contractClass.at(sideChainObj.addr);
        console.log('new/get sideChainObj',sideChainObj);

        _sideChainObjList[scidHash] = sideChainObj;
        return _sideChainObjList[scidHash];
    }
}

let ifcEtherUtils = new IFCEtherUtils();
export default ifcEtherUtils;
