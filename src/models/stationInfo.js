const mongoose = require('mongoose');

// geojson is long, lat (not lat, long)
const pointSchema = new mongoose.Schema({
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  });

const stationInfoSchema = new mongoose.Schema({
    stationId: {
        type: String,
        required: true,
    },
    location: {
        type: pointSchema,
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

// Only fulltext search english for now
stationInfoSchema.index({
    // stationName: 'text', 
    // stationAddress: 'text',
    // stationArea: 'text',
    stationName_en: 'text', 
    stationAddress_en: 'text',
    stationArea_en: 'text'
}, { background: false });

stationInfoSchema.index({ "location": "2dsphere" }, { background: false });

const StationInfo = mongoose.model('StationInfo', stationInfoSchema);

module.exports = StationInfo;