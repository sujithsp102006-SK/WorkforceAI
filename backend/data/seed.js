require('dotenv').config();
const { connectDB, getIsMongo, storeFilePath } = require('../config/db');
const Employee = require('../models/Employee');
const sampleEmployees = require('./seedData');
const fs = require('fs');

async function runSeed() {
  console.log('[Seed] Starting database seeding process...');
  await connectDB();

  if (getIsMongo()) {
    try {
      await Employee.deleteMany({});
      console.log('[Seed] Cleared existing MongoDB employees.');
      await Employee.insertMany(sampleEmployees);
      console.log(`[Seed] Successfully inserted ${sampleEmployees.length} realistic employees into MongoDB!`);
      process.exit(0);
    } catch (err) {
      console.error('[Seed] MongoDB insertion failed:', err);
      process.exit(1);
    }
  } else {
    try {
      fs.writeFileSync(storeFilePath, JSON.stringify(sampleEmployees, null, 2), 'utf8');
      console.log(`[Seed] Successfully initialized local JSON store with ${sampleEmployees.length} realistic employees!`);
      process.exit(0);
    } catch (err) {
      console.error('[Seed] JSON file write failed:', err);
      process.exit(1);
    }
  }
}

runSeed();
