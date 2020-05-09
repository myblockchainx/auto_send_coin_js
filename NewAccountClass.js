
var nearlib = require("nearlib");
var sendJson = require('fetch-send-json');
var { generateSeedPhrase } = require( 'near-seed-phrase');
var NETWORK_ID =  "default";
const KEY_UNIQUE_PREFIX = '_4:'
const KEY_WALLET_ACCOUNTS = KEY_UNIQUE_PREFIX + 'wallet:accounts_v2'
const KEY_ACTIVE_ACCOUNT_ID = KEY_UNIQUE_PREFIX + 'wallet:active_account_id_v2'

class NewAccountClass {
    constructor(){
        this.backUrl = "http://192.168.80.36:3002";
        this.accMap = new Map();
        this.accounts = JSON.parse(
            this.accMap.get(KEY_WALLET_ACCOUNTS) || '{}'
        )
        this.accountId = this.accMap.get(KEY_ACTIVE_ACCOUNT_ID) || ''
    }
    async initD(){
        this.keyStore = new nearlib.keyStores.UnencryptedFileSystemKeyStore("/Users/rooat/.near-credentials");
        let inMemorySigner = new nearlib.InMemorySigner(this.keyStore);
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
        this.connection =   nearlib.Connection.fromConfig({
            networkId: NETWORK_ID,
            provider: { type: 'JsonRpcProvider', args: { url:  'http://192.168.80.36:3030/' } },
            signer: signer
        })
    }
    async start(){
        await this.initD();

        let accountId = "japoia";
        let email = "dgiekg@33.com";
        let phoneNumber = "13145767855";
        await this.createNewAccount(accountId);

        let account = this.getAccount(accountId);
        const accountKeys = await account.getAccessKeys();
        const { seedPhrase, publicKey } = generateSeedPhrase();
        if (!accountKeys.some(it => it.public_key.endsWith(publicKey))) {
            await account.addKey(publicKey);
        }
        console.log("accKey:",accountKeys)
        await this.createPhrase(accountId,email, phoneNumber, seedPhrase);

    }
    async saveAndSelectAccount(accountId, keyPair) {
        await this.keyStore.setKey(NETWORK_ID, accountId, keyPair)
        this.accounts[accountId] = true
        this.accountId = accountId
        this.save()
	    console.log("save is ok")
    }
    getAccount(accountId){
        return new nearlib.Account(this.connection, accountId)
    }
    async createNewAccount(accountId){
        try {
            let keyPair = nearlib.KeyPair.fromRandom('ed25519');            
            let ss = await sendJson('POST', this.backUrl+"/account", {
                newAccountId: accountId,
                newAccountPublicKey: keyPair.publicKey.toString()
            })
            console.log("ss:",ss)
            await this.saveAndSelectAccount(accountId, keyPair);
        } catch (error) {
            console.log("createNewAccount:",error)
        }
        
    }

    async createPhrase(accountId, email,phoneNumber,seedPhrase){
        try {
            let res = await  sendJson('POST', this.backUrl+"/account/sendRecoveryMessage", {
                accountId,
                email,
                phoneNumber,
                seedPhrase
            });
            console.log("res:",res)
        } catch (error) {
            console.log("e:",error)
        }
        
    }
    save() {
        this.accMap.set(KEY_ACTIVE_ACCOUNT_ID, this.accountId)
        this.accMap.set(KEY_WALLET_ACCOUNTS, JSON.stringify(this.accounts))
    }
}
var newAcc = new NewAccountClass()
newAcc.start();