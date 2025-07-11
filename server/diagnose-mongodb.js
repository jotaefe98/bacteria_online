#!/usr/bin/env node

// MongoDB Atlas Connection Diagnostic Script
const { MongoClient } = require('mongodb');
const https = require('https');
const fs = require('fs');

// Get MongoDB URI from environment or ask user
const MONGODB_URI = process.env.MONGODB_URI || process.argv[2];

if (!MONGODB_URI) {
  console.log('❌ Please provide MongoDB URI:');
  console.log('   node diagnose-mongodb.js "mongodb+srv://user:pass@cluster.mongodb.net/dbname"');
  console.log('   or set MONGODB_URI environment variable');
  process.exit(1);
}

console.log('🔍 MongoDB Atlas Connection Diagnostic');
console.log('=====================================');

// Test 1: Parse URI
console.log('\n1. Parsing MongoDB URI...');
try {
  const url = new URL(MONGODB_URI);
  console.log('✅ URI format is valid');
  console.log(`   Host: ${url.hostname}`);
  console.log(`   Database: ${url.pathname.replace('/', '')}`);
  console.log(`   Options: ${url.search}`);
} catch (error) {
  console.log('❌ Invalid URI format:', error.message);
  process.exit(1);
}

// Test 2: DNS Resolution
console.log('\n2. Testing DNS resolution...');
const hostname = new URL(MONGODB_URI).hostname;
require('dns').lookup(hostname, (err, address) => {
  if (err) {
    console.log('❌ DNS resolution failed:', err.message);
  } else {
    console.log('✅ DNS resolution successful:', address);
  }
});

// Test 3: HTTPS connectivity (for Atlas)
console.log('\n3. Testing HTTPS connectivity...');
const httpsOptions = {
  hostname: hostname,
  port: 443,
  path: '/',
  method: 'GET',
  timeout: 10000
};

const httpsReq = https.request(httpsOptions, (res) => {
  console.log('✅ HTTPS connection successful');
  console.log(`   Status: ${res.statusCode}`);
}).on('error', (err) => {
  console.log('❌ HTTPS connection failed:', err.message);
}).on('timeout', () => {
  console.log('❌ HTTPS connection timeout');
});

httpsReq.end();

// Test 4: MongoDB Connection
console.log('\n4. Testing MongoDB connection...');

const connectionOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 75000,
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
  retryWrites: true,
  ssl: true,
  tls: true,
  tlsInsecure: false,
};

const client = new MongoClient(MONGODB_URI, connectionOptions);

client.connect()
  .then(async () => {
    console.log('✅ MongoDB connection successful');
    
    // Test database operations
    console.log('\n5. Testing database operations...');
    
    try {
      // Test ping
      const db = client.db();
      const pingResult = await db.command({ ping: 1 });
      console.log('✅ Ping successful:', pingResult);
      
      // Test collection creation
      const testCollection = db.collection('connection_test');
      const insertResult = await testCollection.insertOne({ 
        test: true, 
        timestamp: new Date(),
        message: 'Connection diagnostic test'
      });
      console.log('✅ Write test successful:', insertResult.acknowledged);
      
      // Test read
      const readResult = await testCollection.findOne({ test: true });
      console.log('✅ Read test successful:', readResult !== null);
      
      // Clean up
      await testCollection.deleteOne({ test: true });
      console.log('✅ Cleanup successful');
      
    } catch (error) {
      console.log('❌ Database operation failed:', error.message);
    }
    
    await client.close();
    console.log('\n🎉 All tests completed!');
    
  })
  .catch((error) => {
    console.log('❌ MongoDB connection failed:', error.message);
    console.log('\n🔧 Troubleshooting tips:');
    console.log('   • Check username/password in URI');
    console.log('   • Verify database user has read/write permissions');
    console.log('   • Add 0.0.0.0/0 to IP whitelist in MongoDB Atlas');
    console.log('   • Ensure cluster is not paused');
    console.log('   • Try using &ssl=true in connection string');
    
    if (error.message.includes('authentication failed')) {
      console.log('   🚨 Authentication error - check credentials');
    }
    
    if (error.message.includes('timeout')) {
      console.log('   🚨 Connection timeout - check IP whitelist');
    }
    
    if (error.message.includes('SSL') || error.message.includes('TLS')) {
      console.log('   🚨 SSL/TLS error - check connection string format');
    }
    
    process.exit(1);
  });

// Cleanup on exit
process.on('SIGINT', async () => {
  console.log('\n🔄 Cleaning up...');
  await client.close();
  process.exit(0);
});
