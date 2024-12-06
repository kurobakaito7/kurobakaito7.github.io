---
title: 📈资源包通过 excel 和 google sheet 导出分享
description: 将资源包以excel表 或者 csv 文件导出给产品经理
date: 2024-10-23
tag:
 - react
---

# 📈资源包通过 excel 和 google sheet 导出分享

## 导出 excel

安装 exceljs
```bash
npm install --save exceljs
```

### 基本使用：
```js
const { Workbook } = require('exceljs');

async function main(){
    const workbook = new Workbook();

    const worksheet = workbook.addWorksheet('mySheet');

    worksheet.columns = [
        { header: 'ID', key: 'id', width: 20 },
        { header: '姓名', key: 'name', width: 30 },
        { header: '出生日期', key: 'birthday', width: 30},
        { header: '手机号', key: 'phone', width: 50 }
    ];

    const data = [
        { id: 1, name: 'kirito', birthday: new Date('1994-07-07'), phone: '13255555555' },
        { id: 2, name: 'kaneki', birthday: new Date('1994-04-14'), phone: '13222222222' },
        { id: 3, name: 'kaito', birthday: new Date('1995-08-08'), phone: '13211111111' }
    ]
    worksheet.addRows(data);

    workbook.xlsx.writeFile('./data.xlsx');    
}

main();
```
就是按照` workbook（工作簿） > worksheet（工作表）> row （行）`的层次来添加数据。

读取 `en-US.json` 和 `zh-CN.json` 的内容，然后按照 id、en-US、zh-CN 的 column 来写入 excel: 
```js
const { Workbook } = require('exceljs');
const fs = require('fs');

const languages = ['zh-CN', 'en-US'];

async function main(){
    const workbook = new Workbook();

    const worksheet = workbook.addWorksheet('test');

    const bundleData = languages.map(item => {
        return JSON.parse(fs.readFileSync(`./${item}.json`));
    })

    const data = [];

    bundleData.forEach((item, index) => {
        for(let key in item) {
            const foundItem = data.find(item => item.id === key);
            if(foundItem) {
                foundItem[languages[index]] = item[key]
            } else {
                data.push({
                    id: key,
                    [languages[index]]: item[key]
                })
            }
        }
    })

    console.log(data);

    worksheet.columns = [
        { header: 'ID', key: 'id', width: 30 },
        ...languages.map(item => {
            return {
                header: item,
                key: item,
                width: 30
            }
        })
    ];

    worksheet.addRows(data);

    workbook.xlsx.writeFile('./bundle.xlsx');    
}

main();
```

### 根据 excel 表生成 `en-US.json` 和 `zh-CN.json` 在项目里引入使用

```js
const { Workbook } = require('exceljs');
const fs = require('fs');

async function main(){
    const workbook = new Workbook();

    const workbook2 = await workbook.xlsx.readFile('./bundle.xlsx');

    const zhCNBundle = {};
    const enUSBundle = {};

    workbook2.eachSheet((sheet) => {

        sheet.eachRow((row, index) => {
            if(index === 1) {
                return;
            }
            const key = row.getCell(1).value;
            const zhCNValue = row.getCell(4).value;
            const enUSValue = row.getCell(5).value;

            zhCNBundle[key] = zhCNValue;
            enUSBundle[key] = enUSValue;
        })
    });

    console.log(zhCNBundle);
    console.log(enUSBundle);
    fs.writeFileSync('zh-CN.json', JSON.stringify(zhCNBundle, null, 2));
    fs.writeFileSync('en-US.json', JSON.stringify(enUSBundle, null, 2));
}

main();
```

## 协同编辑

使用 google sheet 来协同编辑，然后导出 `csv` 文件，然后再通过脚本生成 `json` 文件。

### 如何用 node 生成和解析 `csv` 文件

使用 `csv-parser 和 csv-stringify` 来生成和解析 `csv` 文件。

安装
```bash
npm install --save-dev csv-stringify
```

#### 生成 `csv` 文件

```js
const { stringify } = require("csv-stringify");
const fs = require('fs');

const languages = ['zh-CN', 'en-US'];

async function main(){
    const bundleData = languages.map(item => {
        return JSON.parse(fs.readFileSync(`./${item}.json`));
    })

    const data = [];

    const messages = JSON.parse(fs.readFileSync('./messages.json'));

    bundleData.forEach((item, index) => {
        for(let key in messages) {
            const foundItem = data.find(item => item.id === key);
            if(foundItem) {
                foundItem[languages[index]] = item[key]
            } else {
                data.push({
                    id: key,
                    defaultMessage: messages[key].defaultMessage,
                    description: messages[key].description,
                    [languages[index]]: item[key]
                })
            }
        }
    })

    console.log(data);

    const columns = {
        id: "Message ID",
        defaultMessage: "Default Message",
        description: "Description",
        'zh-CN': "zh-CN",
        'en-US': "en-US"
    };
      
    stringify(data, { header: true, columns }, function (err, output) {
        fs.writeFileSync("./messages.csv", output);
    });
}

main();
```

将 `csv` 文件上传到 google sheet 中

#### 导出 `csv` 文件

在 google sheet url 后加一个 `export?format=csv`, 如：
`https://docs.google.com/spreadsheets/d/1uNl_h9qZMxj8DLshh7w30_m_MFgYVVj6tnGl896Qnsc/export?format=csv`, 就可以本地下载 `csv` 文件了。

#### 在代码中下载并解析 `csv` 文件

```js
const { execSync } = require('child_process');
const { parse } = require("csv-parse/sync");
const fs = require('fs');

const sheetUrl = "https://docs.google.com/spreadsheets/d/1uNl_h9qZMxj8DLshh7w30_m_MFgYVVj6tnGl896Qnsc";

execSync(`curl -L ${sheetUrl}/export?format=csv -o ./message2.csv`, {
    stdio: 'ignore'
});

const input = fs.readFileSync("./message2.csv");

const records = parse(input, { columns: true });

console.log(records);
```
这里使用 `curl` 命令来下载，`-L` 是自动跳转的意思，因为访问这个 url 会跳转一个新的地址

#### 生成 `json` 文件

```js
const { execSync } = require('child_process');
const { parse } = require("csv-parse/sync");
const fs = require('fs');

const sheetUrl = "https://docs.google.com/spreadsheets/d/1uNl_h9qZMxj8DLshh7w30_m_MFgYVVj6tnGl896Qnsc";

execSync(`curl -L ${sheetUrl}/export?format=csv -o ./message2.csv`, {
    stdio: 'ignore'
});

const input = fs.readFileSync("./message2.csv");

const data = parse(input, { columns: true });

const zhCNBundle = {};
const enUSBundle = {};

data.forEach(item => {
    const keys = Object.keys(item);
    const key = item[keys[0]];
    const valueZhCN = item[keys[3]];
    const valueEnUS = item[keys[4]];

    zhCNBundle[key] = valueZhCN;
    enUSBundle[key] = valueEnUS;
})

console.log(zhCNBundle);
console.log(enUSBundle);

fs.writeFileSync('zh-CN.json', JSON.stringify(zhCNBundle, null, 2));
fs.writeFileSync('en-US.json', JSON.stringify(enUSBundle, null, 2));
```

⛓️[实现代码](https://github.com/kurobakaito7/excel-export)