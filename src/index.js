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

app.get('/stations', async (req, res) => {
    try {
        const stationResults = await StationInfo.find({});

        res.send({stations: stationResults, count: stationResults.length });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({error_msg: 'Something happened on the server'});
    }
});

app.get('/stations/list', async (req, res) => {
    try {
        let pageIndex = 0;
        let pageSize = 20;

        if (req.query.page || req.query.size) {
            if (req.query.page) {
                pageIndex = parseInt(req.query.page);
            }

            if (req.query.size) {
                pageSize = parseInt(req.query.size);
            }

            if (isNaN(pageIndex) || isNaN(pageSize)) {
                return res.status(400).send({ error_msg: "parameters should be integers (ie: '123')" });
            }

        }
        const stationResults = await StationInfo.find({}).skip(pageIndex*pageSize).limit(pageSize);

        res.send({ stations: stationResults, count: stationResults.length });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({error_msg: 'Something happened on the server'});
    }
});




app.get('/stations/nearby', async (req, res) => {
    const locQuery = req.query.loc;
    console.log(`Location is: ${locQuery}`);
    
    if (!locQuery) {
        return res.status(400).send({error_msg: 'loc paramter must not be empty'});
    }

    const locParams = locQuery.split(',');

    if (locParams.length !== 2) {
        return res.status(400).send({ error_msg: "loc parameter should be in latitude, longitude format '####,####'" });
    }

    const latitude = parseFloat(locParams[0]);
    const longitude = parseFloat(locParams[1]);
    if (isNaN(latitude) || isNaN(longitude)) {
        return res.status(400).send({ error_msg: "loc parameters should be numbers (ie: '23.5,123.4')" });
    }
    
    let agg = StationInfo.aggregate();

    let nearbyMaxDist = 3000;
    let maxTotalBikes = 30;
    let maxEmptyBikes = 3;
    let maxOccupiedBikes = 5;

    agg = agg.near({
        near: {
            type: 'Point',
            coordinates: [longitude, latitude]
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

    try {
        let stationResults = await agg.exec();
        res.send({ stations: stationResults, count: stationResults.length });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({error_msg: 'Something happened on the server'});
    }
});

app.get('/stations/search', async (req, res) => {
    const searchTerm = req.query.q;
    const locQuery = req.query.loc;

    if (!searchTerm && !locQuery) {
        return res.send({ stations: [], count: 0 });
    }

    let agg = StationInfo.aggregate();

    // first search by location because use case is want to find the nearest youbike
    // stations to the user (then it is the name/address of the you bike station)
    if (locQuery) {    
        const locParams = locQuery.split(',');

        if (locParams.length !== 2) {
            return res.status(400).send({ error_msg: "loc parameter should be in latitude, longitude format '####,####'" });
        }
    
        const latitude = parseFloat(locParams[0]);
        const longitude = parseFloat(locParams[1]);
        if (isNaN(latitude) || isNaN(longitude)) {
            return res.status(400).send({ error_msg: "loc parameters should be numbers (ie: '23.5,123.4')" });
        }

        agg = agg.near({
            near: {
                type: 'Point',
                coordinates: [parseFloat(longitude), parseFloat(latitude)]
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

    try {
        let stationResults = await agg.exec();

        res.send({ stations: stationResults, count: stationResults.length });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({error_msg: 'Something happened on the server'});
    }
});

// Deprecated -- could return/redirect instead, but keep around for reference
/*
app.get('/stations/textsearch', async (req, res) => {
    const searchTerm = req.query.q;
    const searchTermRegEx = new RegExp(searchTerm, 'i');

    try {
        // Chinese search, for now use regex, but could look at using a more
        // complicated but performant full text chinese search like elasticsearch
        // later
        const stationSearch = await StationInfo.find({ $or: [
            { stationName: { $regex: searchTermRegEx }},
            { stationAddress: { $regex: searchTermRegEx }},
            { stationArea: { $regex: searchTermRegEx }},
        ]});

        const stationSearchEn = await StationInfo.find({ $text: { $search: searchTerm }});

        // Combine both chinese and english search results and removes duplicates
        const combinedStations = [...new Set([...stationSearch, ...stationSearchEn])];

        console.log(`Searched for: ${searchTerm} and found ${combinedStations.length} stations`);
        res.send({
            stations: combinedStations
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({error_msg: 'Something happened on the server'});
    }
});


app.get('/stations/locsearch', async (req, res) => {
    const locQuery = req.query.loc;
    const locParams = locQuery.split(',');

    try {
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
        });

        console.log(`Searched for: ${locQuery} and found ${stationSearchLoc.length} stations`);

        res.send({
            stations: stationSearchLoc
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).send({error_msg: 'Something happened on the server'});
    }
});
*/

app.listen(port,  () => {
    console.log('Server is up on port '+port);
});

module.exports = app;