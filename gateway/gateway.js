const https = require('https');
const fs = require('fs');
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const { Readable } = require('stream');


const app = express();
const port = process.env.PORT || 3000;

// Read key.js file
const SK = fs.readFileSync('key/key.js', 'utf8');

// CORS middleware to allow requests from any origin
app.use(cors());
// Parse JSON bodies (as sent by API clients)
app.use(express.json());

// Read the certificate and key files
const privateKey = fs.readFileSync('cert/sunsun.dev.key', 'utf8');
const certificate = fs.readFileSync('cert/sunsun.dev.cer', 'utf8');
const ca = fs.readFileSync('cert/sunsun.dev.fullchain.cer', 'utf8');

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

        // Create a Readable stream from the request body
        const streamRequest = new Readable({
            read() {
                this.push(JSON.stringify({
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
                }));
                this.push(null);
            }
        });

        // Send a POST request to OpenAI API server
        // and wait for the response
        // and return the response to the frontend app
        const response = await axios.post('https://api.openai.com/v1/chat/completions', streamRequest, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': SK, // API key
                'Transfer-Encoding': 'chunked',
            },
        });

        // Stream the response back to the frontend app
        // using express response object (res)
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Transfer-Encoding', 'chunked');
        response.data.pipe(res);
    } catch (error) {
        console.error(error);
        res.status(500).send('Something went wrong');
    }
});


// Start the HTTPS server on the specified port
// httpsServer.listen(port, () => {
//     console.log(`Server listening on port ${port}`);
// });

// Start the HTTP server on the specified port for testing
app.listen(4000, () => {
    console.log(`Server listening on port 4000`);
});