const https = require('https');
const fs = require('fs');
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

import {SK} from './key.js';

// CORS middleware to allow requests from any origin
app.use(cors());
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Read the certificate and key files
const privateKey = fs.readFileSync('/root/cert/sunsun.dev.key', 'utf8');
const certificate = fs.readFileSync('/root/cert/sunsun.dev.cer', 'utf8');
const ca = fs.readFileSync('/root/cert/sunsun.dev.fullchain.cer', 'utf8');

// Create the credentials object
const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

// Create the HTTPS server using the credentials and the express app as the request handler function (app)
const httpsServer = https.createServer(credentials, app);

// Route to handle chat requests
// from the frontend app and forward them
// to OpenAI API server using axios library and return the response
// to the frontend app using express response object (res)
app.post('/v1/chat/completions', async (req, res) => {
    try {
        // Extract the data from the request body
        const {
            model,
            messages,
            temperature,
            top_p,
            n,
            stream,
            stop,
            max_tokens,
            presence_penalty,
            frequency_penalty,
            logit_bias,
            user
        } = req.body;

        // Send a POST request to OpenAI API server
        // and wait for the response
        // and return the response to the frontend app
        const response = await axios.post('https://api.openai.com/v1/chat/completions', {
            model,
            messages,
            temperature,
            top_p,
            n,
            stream,
            stop,
            max_tokens,
            presence_penalty,
            frequency_penalty,
            logit_bias,
            user
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': SK // API key
            }
        });

        // Send the response back to the frontend app
        // using express response object (res)
        res.send(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong');
    }
});

// Start the HTTPS server on the specified port
httpsServer.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
