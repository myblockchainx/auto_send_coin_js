var fs = require("fs");
var readLine = require("readline");

/**
 * 按行读取文件内容
 *
 * @param fileName 文件名路径
 * @param callback 回调函数
 *
 * @return 字符串数组
 */
var addrSet = new Set();
var from_value = 0;
function readFileToArr(fileName, callback) {

    var arr = [];
    var readObj = readLine.createInterface({
        input: fs.createReadStream(fileName)
    });

    // 一行一行地读取文件
    readObj.on('line', function (line) {
        let datas = JSON.parse(line);
        if(!addrSet.has(datas.from)){
            addrSet.add(datas.from);
        }
        if(!addrSet.has(datas.to)){
            addrSet.add(datas.to);
        }
        value += Number(datas.value);
        arr.push(line);
    });
    // 读取完成后,将arr作为参数传给回调函数
    readObj.on('close', function () {
        callback(arr);
    });
}


// 读取数据后,处理完成后放入outpu.txt
readFileToArr('./temps.json', function (arr) {
    // 通过回调得到的,按行获得的数据
    console.log("size:",addrSet.size);
    console.log("value:",value)
    // var tempArr = [];

    // arr.forEach((ele) => {
    //     tempArr.push("b." + ele + " as hc_" + ele);
    // });
    
    // fs.writeFile('./output.txt', tempArr.join("\n"),
    //     function (err) {
    //         if (err) throw err; 
    //     });
});