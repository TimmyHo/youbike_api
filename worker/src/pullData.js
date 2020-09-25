const https = require('https');
const fs = require('fs');
const path = require('path');

const dataFolder = '/var/lib/youbike/data';
// if (!fs.existsSync(dataFolder)){
//     fs.mkdirSync(dataFolder, { recursive: true });
// }


let jsonFilePath = path.join(dataFolder, 'currData.json',);

let currDate = new Date().toISOString();
let timestampFilePath = path.join(dataFolder, `${currDate}.json`);
const file = fs.createWriteStream(jsonFilePath);
const backupFile = fs.createWriteStream(timestampFilePath);

const request = https.get("https://tcgbusfs.blob.core.windows.net/blobyoubike/YouBikeTP.json", (response)  => {
  response.pipe(file);
  // response.pipe(backupFile)
});
