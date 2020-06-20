var nearlib = require('nearlib')
import { findSeedPhraseKey } from 'near-seed-phrase'

class SendCoinClass {
    constructor() {
        this.account = null;
        this.currentNonce = 0;
    }
    
    async initD(){
        //私钥路径
        let keyStore = new nearlib.keyStores.UnencryptedFileSystemKeyStore("/Users/rooat/.near-credentials");
        let inMemorySigner = new nearlib.InMemorySigner(keyStore);
        // console.log(inMemorySigner)
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
        let connection =   nearlib.Connection.fromConfig({
            networkId: "default",
            provider: { type: 'JsonRpcProvider', args: { url:  'http://192.168.80.36:3030/' } },
            signer: signer
        })
        //发送者
        this.account = new nearlib.Account(connection, "dkeka");
    }

    async start(){
        await this.initD();
        let re = ["eae1"];
        let index =0;
        while (true){
            index++
            await this.sleep(1000)
            let accessKey = await this.account.findAccessKey();
            console.log("nonce--",accessKey.nonce)
            if(this.currentNonce < accessKey.nonce){
                this.currentNonce = accessKey.nonce;
                await this.excute(re[index]);
                console.log("res:ok:",new Date().getTime())
            }
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
    async excute(receiver){
        try {
            //接收者
            await this.account.sendMoney(receiver, "100000000000000")
            
        } catch (error) {
            console.log("er:",error)
        }
    }
    findPhrase(){
        const { secretKey } = findSeedPhraseKey(seedPhrase, publicKeys)
        if (!secretKey) {
            throw new Error(`Cannot find matching public key for account ${accountId}`);
        }

        const keyPair = nearlib.KeyPair.fromString(secretKey)
        await tempKeyStore.setKey(NETWORK_ID, accountId, keyPair)
    }
}
var send = new SendCoinClass();
send.start();
