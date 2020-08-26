const express = require('express');

const db = require('./db/mongoose');

const StationInfo = require('./models/stationInfo');

const app = express();

const port = process.env.PORT || 5000;

app.use(express.urlencoded({extended: true}));

app.get('', (req, res) => {
    res.send({
        title: 'Hello World',
        name: 'Timmy Ho'
    });
});


app.get('/stations/nearby', async (req, res) => {
    const locQuery = req.query.loc;
    console.log(`Location is: ${locQuery}`);
    
    if (!locQuery) {
        res.status(400).send({error: 'Invalid request'});
    }
j
    const locParams = locQuery.split(',');
    
    let agg = StationInfo.aggregate();

    let nearbyMaxDist = 3000;
    let maxTotalBikes = 30;
    let maxEmptyBikes = 3;
    let maxOccupiedBikes = 5;

    agg = agg.near({
        near: {
            type: 'Point',
            coordinates: [parseFloat(locParams[1]), parseFloat(locParams[0])]
        },
        distanceField: 'distanceFromPoint', // required
        maxDistance: nearbyMaxDist,
        query: {
            active: 1
        }
    });

    const distanceScore = {$divide: [{$subtract: [nearbyMaxDist, '$distanceFromPoint']}, nearbyMaxDist]};
    const numTotalBikesScore = {$min: [{$divide: ['$numTotalBikeSpots', maxTotalBikes]}, 1]};
    const numEmptyBikesScore = {$min: [{$divide: ['$numEmptyBikeSpots', maxEmptyBikes]}, 1]};
    const numOccupiedBikesScore = {$min: [{$divide: ['$numOccupiedBikeSpots', maxOccupiedBikes]}, 1]};

    // Uses each score to get a max out of 1 and then divides by 4. 
    // Note: Some of these fields/score could be done during data update,
    //  but did it at aggregation to keep flexibility
    agg = agg.addFields({
        nearbyScore: {
            $round: [{
                $divide: [{
                    $add: [
                        distanceScore,
                        numTotalBikesScore,
                        numEmptyBikesScore,
                        numOccupiedBikesScore
                    ]},
                    4
                ]
            },
            5
        ]}
    });

    agg = agg.sort({
        nearbyScore: -1
    });

    let stationResults = await agg.exec().catch((err) => {
        console.log(err);
        res.status(400).send({error_msg: 'Something happened on the server'});
    });

    res.send({ stations: stationResults });
});

app.get('/stations/search', async (req, res) => {
    const searchTerm = req.query.q;
    const locQuery = req.query.loc;

    console.log(`Search term is: ${searchTerm} -- Location is: ${locQuery}`);
    let agg = StationInfo.aggregate();

    // first search by location because use case is want to find the nearest youbike
    // stations to the user (then it is the name/address of the you bike station)
    if (locQuery) {    
        const locParams = locQuery.split(',');
    
        agg = agg.near({
            near: {
                type: 'Point',
                coordinates: [parseFloat(locParams[1]), parseFloat(locParams[0])]
            },
            distanceField: 'distanceFromPoint', // required
            maxDistance: 1000
        });
    }

    if (searchTerm) {
        const searchTermRegEx = new RegExp(searchTerm, 'i');

        // Since the geoindex may already be used and the logic
        // will be easier, use the regex search for english instead
        // of the search text index (since can't have both geoindex
        // and search text index in the same query/aggregate).
        agg = agg.match({ $or: [
                { stationName: { $regex: searchTermRegEx }},
                { stationAddress: { $regex: searchTermRegEx }},
                { stationArea: { $regex: searchTermRegEx }},
                { stationName_en: { $regex: searchTermRegEx }},
                { stationAddress_en: { $regex: searchTermRegEx }},
                { stationArea_en: { $regex: searchTermRegEx }}
            ]
        });
    }

    if (locQuery) {
        agg = agg.sort({ distanceFromPoint: 1 });
    }

    let stationResults = await agg.exec().catch((err) => {
        console.log(err);
        res.status(400).send({error_msg: 'Something happened on the server'});
    });

    res.send({stations: stationResults });
});

app.get('/stations/textsearch', async (req, res) => {
    const searchTerm = req.query.q;
    const searchTermRegEx = new RegExp(searchTerm, 'i');

    // Chinese search, for now use regex, but could look at using a more
    // complicated but performant full text chinese search like elasticsearch
    // later
    const stationSearch = await StationInfo.find({ $or: [
        { stationName: { $regex: searchTermRegEx }},
        { stationAddress: { $regex: searchTermRegEx }},
        { stationArea: { $regex: searchTermRegEx }},
    ]})
    .catch(err => {
        console.log(err);
        res.status(400).send({error_msg: 'Something happened on the server'});
    });

    const stationSearchEn = await StationInfo.find({ $text: { $search: searchTerm }})
    .catch(err => {
        console.log(err);
        res.status(400).send({error_msg: 'Something happened on the server'});
    });

    // Combine both chinese and english search results and removes duplicates
    const allStations = [...new Set([...stationSearch, ...stationSearchEn])];

    console.log(`Searched for: ${searchTerm} and found ${allStations.length} stations`);
    res.send({
        stations: allStations
    });
});


app.get('/stations/locsearch', async (req, res) => {
    const locQuery = req.query.loc;
    const locParams = locQuery.split(',');

    const stationSearchLoc = await StationInfo.find({
        location: { 
            $near: {
                $geometry: {
                    type: 'Point',
                    coordinates: [parseFloat(locParams[1]), parseFloat(locParams[0])]
                },
                $maxDistance: 1000
            }
        }
    })
    .catch(err => {
        console.log(err);
        res.status(400).send({error_msg: 'Something happened on the server'});
    });

    console.log(`Searched for: ${locQuery} and found ${stationSearchLoc.length} stations`);

    res.send({
        stations: stationSearchLoc
    });
});


app.listen(port,  () => {
    console.log('Server is up on port '+port);
});