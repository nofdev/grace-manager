// This snippet from gateway/gateway-grace-worker.js is used to send and receive messages from the server by using axios

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Handle GET requests under the /users path
app.get('/receive', async (req, res) => {
    try {
        // Send a GET request to the backend API
        const response = await axios.get('http://localhost:8000/receive');

        // Forward the response from the backend API to the client
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Handle POST requests under the /users path
app.post('/send', async (req, res) => {
    try {
        // Get data from client request
        const data = req.body;

        // Send a POST request to the backend API
        const response = await axios.post('http://localhost:8000/send', data);

        // Forward the response from the backend API to the client
        res.json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.listen(port, () => {
    console.log(`API Gateway listening at http://localhost:${port}`);
});
