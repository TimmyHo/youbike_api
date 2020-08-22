const express = require('express');

const app = express();

const port = process.env.PORT || 5000;

app.get('', (req, res) => {
    res.send({
        title: 'Hello World',
        name: 'Timmy Ho'
    });
});

app.listen(port,  () => {
    console.log('Server is up on port '+port);
});