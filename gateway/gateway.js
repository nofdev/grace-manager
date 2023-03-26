// This snippet from gateway/gateway.js is the gateway between the frontend and the backend
// Running on Node.js

const express = require('express');
const library = require('./library');

const app = express();
const port = 3000;

// Handle GET requests under the /endpoint path
app.get('/endpoint', (req, res) => {
    try {
        // Call the library function to process the request
        const result = library.processRequest(req.query);

        // Send the result back to the client
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/endpoint', (req, res) => {
    try {
        // Call the library function to process the request
        const result = library.processRequest(req.body);

        // Send the result back to the client
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
})

// OAuth 2.0
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');

// Middleware for parsing JSON request body
app.use(bodyParser.json());

// Secret key for JWT token
const secretKey = 'my-secret-key';

// Route to get access token
app.post('/auth/token', async (req, res) => {
    try {
        // Check client credentials (in this example, hardcoded)
        const { clientId, clientSecret } = req.body;
        if (clientId !== 'my-client-id' || clientSecret !== 'my-client-secret') {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        // Generate JWT access token with expiration time of 1 hour
        const accessToken = jwt.sign({ sub: 'my-user-id' }, secretKey, { expiresIn: '1h' });

        // Return access token
        res.json({ access_token: accessToken });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Middleware to authenticate user with access token
const authenticateUser = async (req, res, next) => {
    try {
        // Get access token from Authorization header
        const authorizationHeader = req.headers.authorization;
        if (!authorizationHeader || !authorizationHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        const accessToken = authorizationHeader.substring(7);

        // Verify JWT access token and get user ID
        const decodedAccessToken = jwt.verify(accessToken, secretKey);
        req.userId = decodedAccessToken.sub;

        next();
    } catch (error) {
        console.error(error);
        res.status(401).json({ error: 'Unauthorized' });
    }
};

// Route to forward API requests to backend
app.all('/api/*', authenticateUser, async (req, res) => {
    try {
        // Get backend API URL
        const backendUrl = 'http://localhost:8000' + req.url.substring(4);

        // Forward request to backend API with user ID in headers
        const response = await axios({
            method: req.method,
            url: backendUrl,
            data: req.body,
            headers: {
                'X-User-Id': req.userId,
            },
        });

        // Forward response from backend API to client
        res.status(response.status).json(response.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// Start API gateway
app.listen(port, () => {
    console.log(`API Gateway listening at http://localhost:${port}`);
});
