require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { messagingApi, middleware } = require('@line/bot-sdk');
const { handleEvent } = require('./lineHandler');

const app = express();
const PORT = process.env.PORT || 3000;

// LINE Channel Configuration
const lineConfig = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || 'DUMMY_TOKEN',
  channelSecret: process.env.LINE_CHANNEL_SECRET || 'DUMMY_SECRET',
};

// Create LINE SDK MessagingApiClient
let client = null;
if (process.env.LINE_CHANNEL_ACCESS_TOKEN && process.env.LINE_CHANNEL_ACCESS_TOKEN !== 'your_channel_access_token_here') {
  client = new messagingApi.MessagingApiClient({
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  });
}

app.use(cors());

// Health Check Endpoint
app.get('/', (req, res) => {
  res.json({
    status: 'online',
    message: 'LINE OA & Express Backend Server is running',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'line-webhook-backend' });
});

// LINE Webhook Endpoint
const lineMiddleware = (req, res, next) => {
  if (!process.env.LINE_CHANNEL_SECRET || process.env.LINE_CHANNEL_SECRET === 'your_channel_secret_here') {
    // Skip signature check in local dev without credentials
    return next();
  }
  return middleware(lineConfig)(req, res, next);
};

app.post('/api/webhook', lineMiddleware, express.json(), async (req, res) => {
  try {
    const events = req.body.events || [];
    
    if (!events || events.length === 0) {
      return res.status(200).send('OK (No events)');
    }

    // Process all events asynchronously
    const results = await Promise.all(
      events.map((event) => {
        if (!client) {
          console.warn('[Webhook] LINE Client not configured with valid access token. Processing offline.');
        }
        return handleEvent(event, client);
      })
    );

    return res.status(200).json({ status: 'success', results });
  } catch (err) {
    console.error('[Webhook] Error handling webhook:', err);
    return res.status(500).json({ status: 'error', message: err.message });
  }
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` Express Webhook Server listening on port ${PORT}`);
  console.log(` Webhook URL: http://localhost:${PORT}/api/webhook`);
  console.log(`====================================================`);
});

module.exports = app;
