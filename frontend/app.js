const express = require('express');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files from the frontend directory using express.static
// __dirname is the current script directory
// ./ is the static directory
app.use(express.static(path.join(__dirname, './')));

// Serve index.html when the root path is requested
app.get('/', (req, res) => {
    // Use path.join to join the current script directory and the index.html file
    // __dirname is the current script directory
    // index.html is the file to serve
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start the server on the specified port
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
