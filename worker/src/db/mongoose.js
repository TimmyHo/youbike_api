const mongoose = require('mongoose');

const dbName = 'youbike-db';
let mongoDbUrl = process.env.MONGODB_URL || `mongodb://127.0.0.1:27017/${dbName}`;

mongoose.connect(mongoDbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
});
