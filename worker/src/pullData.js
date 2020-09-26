const https = require('https');
const fs = require('fs');
const path = require('path');

const dataFolder = '/var/lib/youbike/data';
// if (!fs.existsSync(dataFolder)){
//     fs.mkdirSync(dataFolder, { recursive: true });
// }

console.log('starting');

let jsonFilePath = path.join(dataFolder, 'currData.json',);

let currDate = new Date().toISOString();

let timestampBackupFilePath = path.join(dataFolder, `youbike-data--${currDate}.json`);

const file = fs.createWriteStream(jsonFilePath);

const request = https.get("https://tcgbusfs.blob.core.windows.net/blobyoubike/YouBikeTP.json", (response)  => {
  response.pipe(file);

  fs.copyFileSync(jsonFilePath, timestampBackupFilePath);
});