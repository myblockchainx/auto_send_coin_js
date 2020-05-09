var nearlib = require('nearlib')

class SendCoinClass {
    constructor() {
        this.account = null;
        this.currentNonce = 0;
    }
    async initD(){
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
        this.account = new nearlib.Account(connection, "dkeka");
    }

    async getNonce() {

    }
    async start(){
        await this.initD();
        while (true){
            await this.sleep(300)
            let accessKey = await this.account.findAccessKey();
            console.log("nonce--",accessKey.nonce)
            if(this.currentNonce < accessKey.nonce){
                this.currentNonce = accessKey.nonce;
                await this.excute();
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
    async excute(){
        try {
            let res = await this.account.sendMoney("eae1", "100000000000000")
            
        } catch (error) {
            console.log("er:",error)
        }
    }
}
var send = new SendCoinClass();
send.start();
