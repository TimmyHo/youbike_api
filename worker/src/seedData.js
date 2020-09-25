const fs = require('fs');
const path = require('path');
const db = require('./db/mongoose');
const mongoose = require('mongoose');

const StationInfo = require('./models/stationInfo');

const dataFolder = '/var/lib/youbike/data';

let jsonFilePath = path.join(dataFolder, 'currData.json');

const contents = fs.readFileSync(jsonFilePath);
let jsonObject = JSON.parse(contents);
let stations = Object.values(jsonObject.retVal);

deleteStations = async () => {
    await StationInfo.deleteMany({});    
}

seedStations = async () => {
    await Promise.all(
        stations.map(async (station) => {
            const stationInfo = new StationInfo({
                stationId: station.sno,
                location: {
                    type: 'Point',
                    coordinates: [
                        station.lng,
                        station.lat
                    ]
                },

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

            await stationInfo.save();

            console.log(`Saving Station #${stationInfo.stationId}`);
        })
    );
}

deleteStations().then(async () => {
    console.log('Deleted all stations');
    await seedStations();
}).then(() => {
    console.log(`Added ${stations.length} stations`);
    process.exit(); 
});