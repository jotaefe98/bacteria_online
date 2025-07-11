// Emergency MongoDB disable script
// Run this if MongoDB keeps failing: node disable-mongodb.js

const fs = require('fs');
const path = require('path');

console.log('🚨 Emergency MongoDB Disable Script');
console.log('===================================');

// Create a flag file to disable MongoDB
const flagFile = path.join(__dirname, '.mongodb-disabled');
fs.writeFileSync(flagFile, 'MongoDB disabled due to persistent connection issues');

console.log('✅ MongoDB has been disabled');
console.log('🔄 Restart the server to run in memory-only mode');
console.log('');
console.log('To re-enable MongoDB:');
console.log('1. Delete the .mongodb-disabled file');
console.log('2. Fix the MongoDB connection issues');
console.log('3. Restart the server');

process.exit(0);
