import { MongoClient, Db, Collection } from "mongodb";
import { GameAnalytics } from "../types/analytics";
import { logger } from "../utils/logger";

// MongoDB connection configuration
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/bacteria_online";
const DATABASE_NAME = "bacteria_online";

class DatabaseManager {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private connected = false;

  constructor() {
    this.connect();
  }

  private async connect(): Promise<void> {
    try {
      // Simplified MongoDB connection options for Atlas
      const options = {
        serverSelectionTimeoutMS: 30000, // 30 seconds
        socketTimeoutMS: 75000, // 75 seconds
        connectTimeoutMS: 30000, // 30 seconds
        maxPoolSize: 10, // Maintain up to 10 socket connections
        retryWrites: true, // Retry writes that fail due to network errors
        // Use default SSL/TLS settings for MongoDB Atlas
        ssl: true,
      };

      this.client = new MongoClient(MONGODB_URI, options);
      await this.client.connect();

      // Test the connection
      await this.client.db("admin").command({ ping: 1 });

      this.db = this.client.db(DATABASE_NAME);
      this.connected = true;
      logger.log("Successfully connected to MongoDB Atlas");
    } catch (error) {
      logger.error("Failed to connect to MongoDB:", error);
      this.connected = false;

      // Try to reconnect after 30 seconds
      setTimeout(() => {
        logger.log("Attempting to reconnect to MongoDB...");
        this.connect();
      }, 30000);
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.connected = false;
      logger.log("Disconnected from MongoDB");
    }
  }

  public isConnected(): boolean {
    return this.connected;
  }

  public getDb(): Db | null {
    return this.db;
  }

  // Get games collection
  public getGamesCollection(): Collection<GameAnalytics> | null {
    if (!this.db) return null;
    return this.db.collection<GameAnalytics>("games");
  }

  // Reconnect if connection is lost
  public async ensureConnection(): Promise<boolean> {
    if (!this.connected) {
      await this.connect();
    }
    return this.connected;
  }
}

export const databaseManager = new DatabaseManager();

// Graceful shutdown
process.on("SIGINT", async () => {
  await databaseManager.disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await databaseManager.disconnect();
  process.exit(0);
});
