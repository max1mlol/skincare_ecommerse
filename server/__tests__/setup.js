'use strict';

process.env.NODE_ENV = 'test';
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });

if (!process.env.SESSION_SECRET) {
  process.env.SESSION_SECRET = 'test-session-secret-min-32-characters-long';
}

if (!process.env.DATABASE_URL) {
  throw new Error(
    'DATABASE_URL is required to run API tests. Copy server/.env.example to server/.env and start PostgreSQL.'
  );
}
