const fs = require('fs');
const mongoose = require('mongoose');

const StationInfo = require('../models/stationInfo');

let jsonFilePath = 'YouBikeTP.json';
//jsonFilePath = 'YouBikeTP-min.json';

if (Object.keys(mongoose.connection.collections).includes('stationinfos')) {
    mongoose.connection.dropCollection('stationinfos');
    console.log('Deleting stationinfos collection');
}

const contents = fs.readFileSync(jsonFilePath);

let jsonObject = JSON.parse(contents);
let stations = Object.values(jsonObject.retVal);

stations.forEach(async (station) => {
    const stationInfo = new StationInfo({
        stationId: station.sno,
        latitude: station.lat,
        longitude: station.lng,

        stationName: station.sna,
        stationAddress: station.ar,
        stationArea: station.sarea,

        stationName_en: station.snaen,
        stationAddress_en: station.aren,
        stationArea_en: station.sareaen,

        numTotalBikeSpots: station.tot,
        numEmptyBikeSpots: station.bemp,
        numOccupiedBikeSpots: station.sbi,

        lastUpdated: station.mday,
        active: station.act,
    });

    // console.log(stationInfo);

    await stationInfo.save((err, stn) => {
        if (err) {
            console.log(station)
        }

        // console.log(stn);
    });
});

console.log(`Added ${stations.length} stations`);
