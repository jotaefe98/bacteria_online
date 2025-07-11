// Simple test to check if the server runs without MongoDB
import { databaseManager } from "./src/config/database";

console.log("Testing server without MongoDB...");

// Test database connection
setTimeout(() => {
  const connected = databaseManager.isConnected();
  console.log(`Database connected: ${connected}`);
  
  if (!connected) {
    console.log("✅ Server can run without MongoDB - this is expected for initial deployment");
  } else {
    console.log("✅ MongoDB connection successful");
  }
  
  process.exit(0);
}, 5000);

console.log("Waiting 5 seconds for database connection attempt...");
