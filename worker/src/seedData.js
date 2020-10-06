const fs = require('fs');
const path = require('path');

const moment = require('moment');

const mongoose = require('mongoose');
const db = require('./db/mongoose');

const StationInfo = require('./models/stationInfo');

let dataFolder = process.env.YOUBIKE_DATA_DIR || '/tmp';

let jsonFilePath = path.join(dataFolder, 'currData.json');

const contents = fs.readFileSync(jsonFilePath);
let jsonObject = JSON.parse(contents);
let stations = Object.values(jsonObject.retVal);

// Should actually just update each station instead of deleting
// and re-adding them (since a server api call could occur during 
// seedData which would return weird/incorrect results).

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

                lastUpdatedDate: moment(station.mday, "YYYYMMDDHHmmss"),
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
