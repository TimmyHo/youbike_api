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

app.get('/stations/textsearch', async (req, res) => {
    const searchTerm = req.query.q;
    const searchTermRegEx = new RegExp(searchTerm);

    // Chinese search, for now use regex, but could look at using a more
    // complicated but performant full text chinese search like elasticsearch
    // later
    const stationSearch = await StationInfo.find({ $or: [
        { stationName: { $regex: searchTermRegEx, $options: 'i' }},
        { stationAddress: { $regex: searchTermRegEx, $options: 'i' }},
        { stationArea: { $regex: searchTermRegEx, $options: 'i' }},
    ]});

    const stationSearchEn = await StationInfo.find({ $text: { $search: searchTerm }});

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
                    coordinates: [locParams[1], locParams[0]]
                },
                $maxDistance: 1000
            }
        }
    });

    console.log(`Searched for: ${locQuery} and found ${stationSearchLoc.length} stations`);

    res.send({
        stations: stationSearchLoc
    });
});


app.listen(port,  () => {
    console.log('Server is up on port '+port);
});