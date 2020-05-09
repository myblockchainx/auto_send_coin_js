const cluster = require('cluster');
const http = require('http');
// const numCPUs = require('os').cpus().length;
var nearlib = require('nearlib')

var success = 0;
var start = new Date().getTime()/1000;
//near login  登录成功生成的文件夹路径
let keyStore = new nearlib.keyStores.UnencryptedFileSystemKeyStore("/Users/rooat/server/neardev1");
    // console.log("ddd---",keyStore)
let inMemorySigner = new nearlib.InMemorySigner(keyStore);

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
var connection =   nearlib.Connection.fromConfig({
    networkId: "default",
    provider: { type: 'JsonRpcProvider', args: { url:  'http://13.250.204.142:3030/' } },
    signer: signer
})
var cbase = new nearlib.Account(connection, "google");
async  function sendMoney(){
    try {
      //修改发送者，接收者，金额
         cbase.sendMoney("baidu", "100000000000000").then(()=>{
           success++
           console.log("ok sen:",success)
         }).catch((e)=>{});
        

    } catch (error) {
        console.log("er:",error)
    }
}

async function sendA(){
  if (cluster.isMaster) {
    console.log(`主进程 ${process.pid} 正在运行`);
  
    // 衍生工作进程。
    for (let i = 0; i < 5; i++) {
      cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
      console.log(`工作进程 ${worker.process.pid} 已退出`);
    });
  } else {
    let len = 10000;
    // let start = new Date().getTime()/1000;
    for(var i =0;i< len;i++){
      setTimeout(()=>{
        sendMoney()
      },500)
         
    }
    // let end = new Date().getTime()/1000;
    // console.log(`工作进程 ${process.pid} --start:`+start+"--end:"+end+"-cha:"+(end-start)+"--tps:"+len*100/(end-start));
    // console.log(`工作进程 ${process.pid}`);
  }
  
}
sendA()
