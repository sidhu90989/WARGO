const functions = require('firebase-functions');
const express = require('express');
const path = require('path');

// Import the built server
const serverPath = path.join(__dirname, '../dist/index.js');
let app;

try {
  const serverModule = require(serverPath);
  app = serverModule.default || serverModule.app || serverModule;
  
  if (typeof app !== 'function') {
    console.error('Server module does not export an Express app');
    app = express();
    app.get('*', (req, res) => {
      res.status(500).json({ error: 'API initialization failed' });
    });
  }
} catch (error) {
  console.error('Failed to load server:', error);
  app = express();
  app.get('*', (req, res) => {
    res.status(500).json({ error: 'Failed to load API server', details: error.message });
  });
}

// Map environment from Firebase Functions config
if (!process.env.SESSION_SECRET && functions.config().app) {
  const config = functions.config().app;
  process.env.SESSION_SECRET = config.session_secret;
  process.env.DATABASE_URL = config.database_url;
  process.env.STRIPE_SECRET_KEY = config.stripe_secret;
  process.env.FIREBASE_SERVICE_ACCOUNT_JSON = config.firebase_account;
  process.env.FRONTEND_ORIGIN = config.frontend_origin;
  process.env.FIREBASE_DATABASE_URL = config.firebase_db_url;
  process.env.REDIS_URL = config.redis_url || '';
  process.env.NODE_ENV = 'production';
  process.env.SIMPLE_AUTH = 'false';
  process.env.COOKIE_SECURE = 'true';
}

// Export as Firebase Function
exports.api = functions.https.onRequest(app);
