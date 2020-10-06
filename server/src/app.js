const path = require('path');
const express = require('express');

const apiRoutes = require('./routes/api');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.urlencoded({extended: true}));

// Define paths for express config
const publicDirPath = path.join(__dirname, '../public');

// Setup static directory to serve
app.use(express.static(publicDirPath));

app.use('/api', apiRoutes);

app.get('', (req, res) => {
    res.sendFile(path.join(publicDirPath, 'html/index.html'));
});

app.listen(port,  () => {
    console.log('Server is up on port '+port);
});

module.exports = app;