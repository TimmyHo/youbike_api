const fs = require('fs');
const path = require('path');
const db = require('./db/mongoose');
const mongoose = require('mongoose');

const StationInfo = require('./models/stationInfo');

let dataFolder = process.env.YOUBIKE_DATA_DIR || '/tmp';

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

            //console.log(`Saving Station #${stationInfo.stationId}`);
        })
    );
}

runScript = async () => {
    await deleteStations();
    console.log('Deleted all stations');

    await seedStations();
    console.log(`Added ${stations.length} stations`);
}

runScript().then(() => {
    process.exit();
});
