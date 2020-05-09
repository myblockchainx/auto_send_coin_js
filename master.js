const cluster = require('cluster');
const http = require('http');
// const numCPUs = require('os').cpus().length;
var nearlib = require('nearlib')

class MasterClass {
  constructor(){
    this.success =0;
    this.lenTx = 30;
    this.procesLen = 4;
    this.sendArr = ["google","baidu","taobao","qq"]
    this.CbaseAr = [];
  }
  async start(){
    await this.sendS();

    if (cluster.isMaster) {
      console.log(`主进程 ${process.pid} 正在运行`);
      // 衍生工作进程。
      for (let i = 0; i < this.procesLen; i++) {
        cluster.fork();
      }
      cluster.on('exit', (worker, code, signal) => {
        console.log(`工作进程 ${worker.process.pid} 已退出`);
      });
    } else {
      
      for(var x=0;x<this.CbaseAr.length;x++){
          for(var i =0;i< this.lenTx;i++){
            this.sendMoney(this.CbaseAr[x]);
          }
      }
    }
    
  }
  async sendS(){
    let conn = await this.init();
    
    for(var j =0;j<conn.length;j++){
      let cb = new nearlib.Account(conn[j], this.sendArr[j]);
      this.CbaseAr.push(cb);
    }
  }
  async sendMoney(cbase){
    try {
      //修改发送者，接收者，金额
        cbase.sendMoney("baidu", "100000000000000")
       this.success ++;
       console.log("res: send ok:--",this.success)
       cbase.sendMoney("baidu", "100000000000000").then(()=>{
        success++
        console.log("ok sen:",success)
      }).catch((e)=>{});

    } catch (error) {
        // console.log("er:",error)
    }
  }
  async init(){
    let connections = [];
    for(var i =0;i<4;i++){
      let paths = "/Users/rooat/server/neardev"+(i+1);
      let keyStore = new nearlib.keyStores.UnencryptedFileSystemKeyStore(paths);
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
      let connection =   nearlib.Connection.fromConfig({
          networkId: "default",
          provider: { type: 'JsonRpcProvider', args: { url:  'http://13.250.204.142:3030/' } },
          signer: signer
      })
      connections.push(connection);
    }
    return connections;
  }
}

var mas = new MasterClass();
mas.start()