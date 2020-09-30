const express = require('express');

const app = express();

const port = process.env.PORT || 5000;

// To satisfy Google Cloud Run's requirement that each docker image must have an open port, starting
// a minimal express server

app.get('', (req, res) => {
    res.send({
        title: 'Youbike API Worker'
    });
});

app.listen(port,  () => {
    console.log('Server is up on port '+port);
});