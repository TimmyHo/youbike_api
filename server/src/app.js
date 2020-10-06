const express = require('express');

const apiRoutes = require('./routes/api');

const app = express();
const port = process.env.PORT || 5000;

app.use(express.urlencoded({extended: true}));

app.use('/api', apiRoutes);

app.get('', (req, res) => {
    res.send({
        title: 'Youbike API Server'
    });
});

app.listen(port,  () => {
    console.log('Server is up on port '+port);
});

module.exports = app;