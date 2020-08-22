const mongoose = require('mongoose');

const stationInfoSchema = new mongoose.Schema({
    stationId: {
        type: String,
        required: true,
    },
    latitude: {
        type: Number,
        required: true,
    },
    longitude: {
        type: Number,
        required: true,
    },

    stationName: {
        type: String,
        required: true
    },
    stationAddress: {
        type: String,
        required: true
    },
    stationArea: {
        type: String,
        required: true
    },

    stationName_en: {
        type: String
    },
    stationAddress_en: {
        type: String
    },
    stationArea_en: {
        type: String
    },

    numTotalBikeSpots: {
        type: Number, 
        required: true
    },
    numEmptyBikeSpots: {
        type: Number,
        required: true
    },
    numOccupiedBikeSpots: {
        type: Number,
        required: true
    },
    
    lastUpdated: {
        type: String,
        required: true
    },
    active: {
        type: Number,
        required: true
    }
}, {
    timestamps: false
});

const StationInfo = mongoose.model('StationInfo', stationInfoSchema);

module.exports = StationInfo;