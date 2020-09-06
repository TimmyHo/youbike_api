const chai = require('chai');
const chaiHttp = require('chai-http');

const fs = require('fs');
const path = require('path');


const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

const StationInfo = require('../src/models/stationInfo.js');
const app = require('../src/index.js');


chai.use(chaiHttp);
const expect = chai.expect;

let mongoServer;

before(async () => {
    // Not the greatest but disconnect the actual connection, should refactor to have 
    // connection uri and connect to db separated
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
    
    // Since this is a clean db, need to ensure the indexes are added
    StationInfo.ensureIndexes();

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

        const stations = await StationInfo.find({});
        expect(stations.length).equal(399);
    });
});

describe('REST api tests', () => {
    describe('/stations -- TESTS', () => {
        it('/stations -- get all stations', async () => {
            const data = await chai.request(app).get('/stations');
            expect(data.body.count).equal(399);
        });
    });

    describe('/stations/list -- TESTS', () => {
        it('/stations/list -- get defaults (20)', async () => {
            const data = await chai.request(app).get('/stations/list');
            expect(data.body.count).equal(20);
        });

        it('/stations/list -- invalid parameters', async () => {
            const data = await chai.request(app).get('/stations/list?page=2&size=abc');
            expect(data.status).equal(400);
        });

        it('/stations/list -- with parameters', async () => {
            const data = await chai.request(app).get('/stations/list?page=10&size=30');
            expect(data.body.count).equal(30);
        });
    });

    describe('/stations/search -- TESTS', () => {
        it('/stations/search -- no parameters', async () => {
            const data = await chai.request(app).get('/stations/search');

            expect(data.body.stations.length).equal(0);
            expect(data.body.count).equal(0);
        });

        it('/stations/search -- only chinese text', async () => {
            const data = await chai.request(app).get(encodeURI('/stations/search?q=中正'));
            expect(data.body.count).equal(39);
        });

        it('/stations/search -- only english text', async () => {
            const data = await chai.request(app).get('/stations/search?q=guting');
            expect(data.body.count).equal(3);
        });

        it('/stations/search -- only location', async () => {
            const data = await chai.request(app).get('/stations/search?loc=25.0242846,121.529252');
            expect(data.body.count).equal(15);
        });
        
        it('/stations/search -- invalid location - no comma', async () => {
            const data = await chai.request(app).get('/stations/search?loc=123.32123');
            expect(data.status).equal(400);
        });

        it('/stations/search -- invalid location - not a number', async () => {
            const data = await chai.request(app).get('/stations/search?loc=an,123');
            expect(data.status).equal(400);
        });

        it('/stations/search -- text and location search', async () => {
            // finds all places within 1000 m
            const data = await chai.request(app).get('/stations/search?q=guting&loc=25.0242846,121.529252');
            expect(data.body.count).equal(2);

            const stations = data.body.stations;
            stations.forEach(station => {
                expect(station.distanceFromPoint).lessThan(1000);
            });
        });
    });

    describe('/stations/nearby -- TESTS', () => {
        it('/stations/nearby -- no parameters', async () => {
            const data = await chai.request(app).get('/stations/nearby');
            expect(data.status).equal(400);
        });

        it('/stations/search -- invalid location - no comma', async () => {
            const data = await chai.request(app).get('/stations/nearby?loc=123.32123');
            expect(data.status).equal(400);
        });

        it('/stations/search -- invalid location - not a number', async () => {
            const data = await chai.request(app).get('/stations/nearby?loc=an,123');
            expect(data.status).equal(400);
        });

        it('stations/nearby - find nearby chiang kai shek residence', async () => {
            const data = await chai.request(app).get('/stations/nearby?loc=25.094189,121.5186994');
            expect(data.body.count).equal(55);

            const stations = data.body.stations;
            // All scores should be less than or equal to 1
            // nearby API currently searches for items within 3000;
            let currScore = 1;
            stations.forEach(station => {
                expect(station.distanceFromPoint).lessThan(3000);
                expect(station.nearbyScore).lte(currScore);
                currScore = station.nearbyScore;
            });
        });
    });
});