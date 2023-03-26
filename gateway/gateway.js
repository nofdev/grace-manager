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

app.listen(port, () => {
    console.log(`API Gateway listening at http://localhost:${port}`);
});
