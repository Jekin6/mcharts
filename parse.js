const fs = require('fs');
const config = {
    jsonDir: './jsonData/',
    csvDir: '/csvData/',
    originalDir: './originalData/',
    errorDir: './errorData/',
    Timetitle: '时间,白屏时间,用户可操作时间,总下载时间',
    Errortitle: '时间,错误量',
    date: new Date().toLocaleDateString(),
}


fs.readFile(`${config.originalDir}${config.date}data.txt`, 'utf8', (err, data) => {
    const jsondata = parse(data)
    parseTime(data);
    parseMobile(jsondata);
    parsePVUV(jsondata);
    fs.writeFile(`${config.jsonDir}${config.date}data.json`, JSON.stringify(jsondata), (err) => {
        if(err) {
            console.log(err);
        } else {
            console.log('data write right');
        }
    })
});

fs.readFile(`${config.errorDir}${config.date}error.txt`, 'utf8', (err, data) => {
    parseError(data);
});

function parseError(data) {
    data = data.split('\n');
    const arr = [];
    arr.push(config.Errortitle);
    let k = 0;
    let time = 0;
    data.forEach((value, index, array) => {
        if(!!value) {
            if(!time) {
                value = value.split('&');
                // console.log(value);
                value = value[value.length -1 ].split('=')[1];
                time = value;
            }
            k++;  
        } else {
            if(time&&k) {
                arr.push(`${time},${k}`);
                time = 0;
                k = 0;
            }
        }
    })
    fs.writeFile(`./charts${config.csvDir}${config.date}error.csv`,arr.join('\n'), (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('error success');
        }
    })
}

/**
 * 
 * 
 * @param {list} data 
 * @returns {Array} json数据
 */
function parse(data) {
    data = data.split('\n');
    const arr = [];
    // data.sort((a, b) => {
    //     return a.nowTime - b.nowTime;
    // })
    data.forEach((value, index, array) => {
        if(!!value) {
            const obj = {};
            value = value.split('&');
            value.forEach((item, i) => {
                const name = item.split('=')[0];
                const val = item.split('=')[1];
                obj[name] = val;
            })
            arr.push(obj);
        } 
    })
    return arr;
}

/**
 * 
 * 
 * @param {Object} data 原始数据
 * 以空行为界限，每个空行一次算平均数
 */
function parseTime(data) {
    data = data.split('\n');
    const arr = [];  
    let time = 0;
    let whiteScreenTime = 0;
    let readyTime = 0;
    let allloadTime = 0;
    let k = 0;
    arr.push(config.Timetitle);
    data.forEach((value, index, array) => {  
        if(!!value) {
            const obj = {};
            value = value.split('&');
            value.forEach((item, i) => {
                const name = item.split('=')[0];
                const val = item.split('=')[1];
                obj[name] = val;
            });
            if(!time) {
                time = obj['nowTime'];
            }
            whiteScreenTime += parseInt(obj['whiteScreenTime']);
            readyTime += parseInt(obj['readyTime']);
            allloadTime += parseInt(obj['allloadTime']);
            k++;
        } else {
            if(whiteScreenTime&&readyTime&&allloadTime) {
                // 以csv方式写入arr数组,并进行清零
                arr.push(`${time},${parseInt(whiteScreenTime/k)},${parseInt(readyTime/k)},${parseInt(allloadTime/k)}`)
                time = 0;
                whiteScreenTime = 0;
                readyTime = 0;
                allloadTime = 0;
                k = 0;
            }     
        } 
        
    })
    // 写入文件
    fs.writeFile(`./charts${config.csvDir}${config.date}time.csv`,arr.join('\n'), (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('time success');
        }
    })
}
/**
 * 
 * 
 * @param {Array} data parse好的数据 
 */
function parseMobile(data) {
    const obj = {};
    const length = data.length;
    // 利用map进行统计
    data.forEach((item, index) => {
        obj[item['mobile']] = obj[item['mobile']] ? obj[item['mobile']]+ 1 : 1;
    });
    const arr = [];
    for(var i in obj) {
        const persent = `${(obj[i]/length*100).toFixed(1)}`
        arr.push(`${i},${persent}`);
    }
    // 写入文件
    fs.writeFile(`./charts${config.csvDir}${config.date}mobile.csv`,arr.join('\n'), (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('mobile success');
        }
    })
}
/**
 * 
 * 
 * @param {Object} data parse好的数据 
 */
function parsePVUV(data) {
    const obj = {};
    // 数据的长度
    const PV = data.length;
    data.forEach((item, index) => {
        obj[item['user_ip']] = obj[item['user_ip']] ? obj[item['user_ip']]+ 1 : 1;
    });
    // 合并对象后的长度
    const UV = Object.keys(obj).length;
    // 写入文件
    fs.writeFile(`./charts${config.csvDir}${config.date}PVUV.csv`, `PV:${PV},UV:${UV}`, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('PVUV success');
        }
    })
}
