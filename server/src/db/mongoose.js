const mongoose = require('mongoose');

console.log('process NODE_ENV = ', process.env.NODE_ENV)

if (process.env.NODE_ENV != 'test') {
    let mongoDbUrl = process.env.MONGODB_URL || 'mongodb://127.0.0.1:27017/youbike-db';

    mongoose.connect(mongoDbUrl, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true
    });
}
