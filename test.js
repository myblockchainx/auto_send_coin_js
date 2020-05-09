var nearlib = require('nearlib')

var success = 0;
var start = new Date().getTime()/1000;
let keyStore = new nearlib.keyStores.UnencryptedFileSystemKeyStore("/Users/rooat/server/neardev");
    // console.log("ddd---",keyStore)
let inMemorySigner = new nearlib.InMemorySigner(keyStore);

let signer = {
    async getPublicKey(accountId, networkId) {
        let privs = await inMemorySigner.getPublicKey(accountId, networkId);
        return privs
    },
    async signHash(hash, accountId, networkId) {
        return inMemorySigner.signHash(hash, accountId, networkId);
    },
    async signMessage(message, accountId, networkId) {
        return await inMemorySigner.signMessage(message, accountId, networkId)
    }
}
var connection =   nearlib.Connection.fromConfig({
    networkId: "default",
    provider: { type: 'JsonRpcProvider', args: { url:  'http://13.250.204.142:3030/' } },
    signer: signer
})
async function sendMoney(){
    try {

       let res = await new nearlib.Account(connection, "eksjg").sendMoney("baidu", "100000000000000")
       success ++;
       
       console.log("res: send ok:--",success)
       let end = new Date().getTime()/1000;
       
       console.log("start:"+start+" end:"+end+" -cha:"+(end-start)+" tps:"+(success/(end-start))*4);

    } catch (error) {
        // console.log("er:",error)
    }
}
module.exports = {sendMoney}
// sendMoney()
