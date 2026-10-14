const fs = require('fs');
const path = require('path');
const net = require('net');
const mongoose = require('mongoose');

let isConnectedToMongo = false;
const storeFilePath = path.resolve(__dirname, '../data/db_store.json');

// Ensure data directory exists
const dataDir = path.dirname(storeFilePath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function probeMongoPort(host = '127.0.0.1', port = 27017, timeoutMs = 800) {
  return new Promise((resolve) => {
    const socket = new net.Socket();
    let isResolved = false;

    socket.setTimeout(timeoutMs);

    socket.on('connect', () => {
      if (!isResolved) {
        isResolved = true;
        socket.destroy();
        resolve(true);
      }
    });

    socket.on('timeout', () => {
      if (!isResolved) {
        isResolved = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.on('error', () => {
      if (!isResolved) {
        isResolved = true;
        socket.destroy();
        resolve(false);
      }
    });

    socket.connect(port, host);
  });
}

async function connectDB() {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/workforce_analytics';

  // Check if URI is localhost/127.0.0.1
  const isLocal = uri.includes('127.0.0.1') || uri.includes('localhost');

  if (isLocal) {
    const isListening = await probeMongoPort('127.0.0.1', 27017, 800);
    if (!isListening) {
      isConnectedToMongo = false;
      console.log('[Database] Notice: Local MongoDB server is not running on 127.0.0.1:27017.');
      console.log('[Database] Seamlessly activated high-performance persistent JSON data store for hackathon reliability.');
      return;
    }
  }

  try {
    console.log(`[Database] Connecting to MongoDB at ${uri}...`);
    mongoose.set('strictQuery', false);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000
    });

    isConnectedToMongo = true;
    console.log('[Database] Connected to MongoDB via Mongoose successfully.');
  } catch (err) {
    isConnectedToMongo = false;
    console.warn(`[Database] MongoDB connection failed (${err.message}).`);
    console.log('[Database] Fallback persistent JSON store activated.');
  }
}

function getIsMongo() {
  return isConnectedToMongo;
}

module.exports = {
  connectDB,
  getIsMongo,
  storeFilePath
};
