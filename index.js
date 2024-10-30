const express = require('express');
const redis = require('redis');
const shortid = require('shortid');
const bodyParser = require('body-parser');

const app = express();

// Create Redis client
const client = redis.createClient();

// Handle Redis client errors
client.on('error', (err) => {
    console.log('Redis Client Error:', err);
});

// Connect to Redis once when the server starts
async function connectToRedis() {
    try {
        await client.connect();
        console.log('Connected to Redis');
    } catch (err) {
        console.error('Error connecting to Redis:', err);
    }
}

connectToRedis();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// POST route to shorten URL
app.post('/shorten', async (req, res) => {
    try {
        const { originalUrl } = req.body;
        const shortCode = shortid.generate();

        // Store in Redis
        await client.set(shortCode, originalUrl);

        res.json({
            originalUrl,
            shortUrl: `http://localhost:3000/${shortCode}`
        });
    } catch (error) {
        console.error('Error while saving to Redis:', error);
        res.status(500).json({ error: 'Failed to save URL' });
    }
});

// GET route to redirect to original URL
app.get('/:shortCode', async (req, res) => {
    try {
        const { shortCode } = req.params;

        // Retrieve original URL from Redis
        const originalUrl = await client.get(shortCode);
        if (!originalUrl) {
            return res.status(404).json('URL not found');
        }

        // Redirect to the original URL
        res.redirect(originalUrl);
    } catch (error) {
        console.error('Error while retrieving from Redis:', error);
        res.status(500).json({ error: 'Failed to retrieve URL' });
    }
});

// Close Redis connection when the server is shutting down
process.on('SIGINT', async () => {
    await client.quit();
    process.exit();
});
