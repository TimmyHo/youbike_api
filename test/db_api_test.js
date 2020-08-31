const chai = require('chai');
const chaiHttp = require('chai-http');

const fs = require('fs');
const path = require('path');


const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');


const app = require('../src/index.js');
const StationInfo = require('../src/models/stationInfo.js');


chai.use(chaiHttp);
const expect = chai.expect;

let mongoServer;

before(async () => {
    // not the gratest but disconnect the actual connection
    if (mongoose.connection.readyState > 0) {
        await mongoose.disconnect();
    }

    mongoServer = new MongoMemoryServer();
    const mongoUri = await mongoServer.getUri();
    await mongoose.connect(mongoUri, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    });

    const jsonFilePath = path.join(__dirname, 'sampleData.json');
    const contents = fs.readFileSync(jsonFilePath);

    let jsonData = JSON.parse(contents);
    await StationInfo.insertMany(jsonData);
});

after(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('sanity checks', () => {
    it('# of station info records', async () => {
        const cnt = await StationInfo.countDocuments();
        expect(cnt).equal(399);
    });
})

describe('REST api tests', () => {
    it('/stations -- get all stations', async() => {
        data = await chai.request(app).get('/stations');
        expect(data.body.length).equal(399);
    });
});