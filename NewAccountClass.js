
var nearlib = require("nearlib");
const nearAPI = require('near-api-js');
var { generateSeedPhrase } = require( 'near-seed-phrase');
var NETWORK_ID =  "default";
var NODE_URL = "http://13.250.204.142:3030";
const ACCESS_KEY_FUNDING_AMOUNT = process.env.REACT_APP_ACCESS_KEY_FUNDING_AMOUNT || '0'
const masterAccountKey = {
    "account_id": "eis",
    "private_key": "2FQRLLerkN7qBX22zY2KMp36tHL5odw7m3aAYK6WqnijbW3v3dKBJAVciAFyrdjx6mkMbqBffA2bS4LKPdLUxzea"
}

class NewAccountClass {
    constructor(){
        this.near = null;
        this.keyStore_unecncry = null;
        this.initBalance = '50000000000000000000000';
        

    }
    async nearClient(){
        this.keyStore_unecncry = new nearlib.keyStores.UnencryptedFileSystemKeyStore("./");
        let inMemorySigner = new nearlib.InMemorySigner(this.keyStore_unecncry);
        let signer = {
            async getPublicKey(accountId, networkId) {
                return await inMemorySigner.getPublicKey(accountId, networkId);
            },
            async signHash(hash, accountId, networkId) {
                return inMemorySigner.signHash(hash, accountId, networkId);
            },
            async signMessage(message, accountId, networkId) {
                return await inMemorySigner.signMessage(message, accountId, networkId)
            }
        }
        this.connection =   nearlib.Connection.fromConfig({
            networkId: NETWORK_ID,
            provider: { type: 'JsonRpcProvider', args: { url: NODE_URL } },
            signer: signer
        })
        
        let keyStore = {
            async getKey() {
                return nearAPI.KeyPair.fromString(masterAccountKey.private_key);
            }
        };
        const near = await nearAPI.connect({
            deps: { keyStore },
            masterAccount: masterAccountKey.account_id,
            nodeUrl: NODE_URL
        });
        return near; 
    }
    async start(accountId){
        this.near = await this.nearClient();
        let index = 1;
        while(true){
            try {
                index ++;
                accountId += index
                await this.sleep(1000);
                await this.createNewAccount(accountId);
                const { seedPhrase, publicKey } = generateSeedPhrase();
                console.log("seedPhrase:",seedPhrase)
                await new nearlib.Account(this.connection, accountId).addKey(
                    publicKey,
                    null,
                    '', // methodName
                    ACCESS_KEY_FUNDING_AMOUNT
                )
                await this.keyStore_unecncry.removeKey(NETWORK_ID, accountId)
            } catch (error) {
                console.log("error,,,")
            }
            
        }
        

    }
    async createNewAccount(accountId){
        try {
            let keyPair = nearlib.KeyPair.fromRandom('ed25519');   
            let masterAccount = await this.near.account(masterAccountKey.account_id)
            await masterAccount.createAccount(accountId, keyPair.publicKey.toString(), this.initBalance);
            await this.keyStore_unecncry.setKey(NETWORK_ID, accountId, keyPair)
        } catch (error) {
            console.log("createNewAccount:",error)
        }
        
    }

    async sleep(times){
        return new Promise((resolve, reject)=>{
            //做一些异步操作
            setTimeout(()=>{
                resolve(1)
            }, times);
        });
    }
    
}
var newAcc = new NewAccountClass()
newAcc.start("newscax");