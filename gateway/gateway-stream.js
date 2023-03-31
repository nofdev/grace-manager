const https = require('https');
const fs = require('fs');
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const http = require('http');
const qs = require('querystring');

const app = express();
const port = process.env.PORT || 3000;

import {SK} from './key.js';

app.use(cors());
app.use(express.json());

const privateKey = fs.readFileSync('/root/cert/api.jiasir.io.key', 'utf8');
const certificate = fs.readFileSync('/root/cert/api.jiasir.io.cert', 'utf8');
const ca = fs.readFileSync('/root/cert/api.jiasir.io.fullchain.pem', 'utf8');

const credentials = {
    key: privateKey,
    cert: certificate,
    ca: ca
};

const httpsServer = https.createServer(credentials, app);

app.post('/chat', (req, res) => {
    const { model, messages, temperature, top_p, n, stream, stop, max_tokens, presence_penalty, frequency_penalty, logit_bias, user } = req.body;

    const postData = qs.stringify({
        model,
        messages,
        temperature,
        top_p,
        n,
        stream: true, // set to stream response
        stop,
        max_tokens,
        presence_penalty,
        frequency_penalty,
        logit_bias,
        user
    });

    const options = {
        hostname: 'api.openai.com',
        path: '/v1/chat/completions',
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': postData.length,
            'Authorization': SK // API key
        }
    };

    const openaiReq = http.request(options, openaiRes => {
        res.writeHead(openaiRes.statusCode, openaiRes.headers);
        openaiRes.pipe(res); // Pipe the response data back to the client
    });

    openaiReq.on('error', error => {
        console.error(error);
        res.status(500).send('Something went wrong');
    });

    openaiReq.write(postData);
    openaiReq.end();
});

httpsServer.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
