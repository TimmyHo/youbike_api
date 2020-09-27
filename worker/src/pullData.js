const https = require('https');
const fs = require('fs');
const path = require('path');

const dataFolder = process.env.YOUBIKE_DATA_DIR || '/tmp';

let jsonFilePath = path.join(dataFolder, 'currData.json',);

let currDate = new Date().toISOString();
let timestampBackupFilePath = path.join(dataFolder, `youbike-data--${currDate}.json`);

const file = fs.createWriteStream(jsonFilePath);

const request = https.get("https://tcgbusfs.blob.core.windows.net/blobyoubike/YouBikeTP.json", (response)  => {
  response.pipe(file);

  fs.copyFileSync(jsonFilePath, timestampBackupFilePath);

  console.log('Downloaded Youbike data successfully');
});