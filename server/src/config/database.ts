import { MongoClient, Db, Collection } from "mongodb";
import { GameAnalytics } from "../types/analytics";
import { logger } from "../utils/logger";
import * as fs from "fs";
import * as path from "path";

// Check if MongoDB is force-disabled
const mongoDisabledFile = path.join(__dirname, "../../.mongodb-disabled");
const isForceDisabled = fs.existsSync(mongoDisabledFile);

// MongoDB connection configuration
const MONGODB_URI_RAW =
  process.env.MONGODB_URI || "mongodb://localhost:27017/bacteria_online";

// Ensure proper SSL parameters for MongoDB Atlas
const MONGODB_URI = MONGODB_URI_RAW.includes("mongodb+srv://")
  ? `${MONGODB_URI_RAW}${
      MONGODB_URI_RAW.includes("?") ? "&" : "?"
    }ssl=true&authSource=admin&retryWrites=true&w=majority`
  : MONGODB_URI_RAW;

const DATABASE_NAME = "bacteria_online";

class DatabaseManager {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private connected = false;
  private disabled = false; // New flag to disable MongoDB completely
  private connectionAttempts = 0;
  private maxConnectionAttempts = 10; // After 10 failed attempts, disable

  constructor() {
    if (isForceDisabled) {
      logger.log("MongoDB force-disabled by flag file");
      this.disable();
      return;
    }
    this.connect();
  }
  private async connect(): Promise<void> {
    if (this.disabled) {
      logger.log("MongoDB is disabled, skipping connection");
      return;
    }

    this.connectionAttempts++;

    // If we've tried too many times, disable MongoDB
    if (this.connectionAttempts > this.maxConnectionAttempts) {
      logger.error(
        `Too many connection attempts (${this.connectionAttempts}), disabling MongoDB`
      );
      this.disable();
      return;
    }

    const maxRetries = 3;
    const retryDelay = 10000; // 10 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        logger.log(
          `MongoDB connection attempt ${attempt}/${maxRetries} (overall: ${this.connectionAttempts})`
        );

        // Try different connection strategies
        const options = this.getConnectionOptions(attempt);

        this.client = new MongoClient(MONGODB_URI, options);

        // Connect with timeout
        await Promise.race([
          this.client.connect(),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Connection timeout")), 45000)
          ),
        ]);

        // Test the connection
        await this.client.db("admin").command({ ping: 1 });

        this.db = this.client.db(DATABASE_NAME);
        this.connected = true;
        this.connectionAttempts = 0; // Reset on successful connection
        logger.log(
          `Successfully connected to MongoDB Atlas (attempt ${attempt})`
        );
        return;
      } catch (error) {
        logger.error(`Connection attempt ${attempt} failed:`, error);

        if (this.client) {
          try {
            await this.client.close();
          } catch (closeError) {
            logger.error("Error closing failed connection:", closeError);
          }
          this.client = null;
        }

        // If this is the last attempt, don't retry immediately
        if (attempt === maxRetries) {
          logger.error("All connection attempts failed");
          this.connected = false;

          // Schedule retry after longer delay
          setTimeout(() => {
            logger.log("Attempting to reconnect to MongoDB...");
            this.connect();
          }, 120000); // 2 minutes
          return;
        }

        // Wait before next attempt
        await new Promise((resolve) => setTimeout(resolve, retryDelay));
      }
    }
  }

  private getConnectionOptions(attempt: number): any {
    const baseOptions = {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 75000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      retryWrites: true,
    };

    // Try different SSL configurations based on attempt
    switch (attempt) {
      case 1:
        // First attempt: Let MongoDB handle SSL automatically
        return {
          ...baseOptions,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        };

      case 2:
        // Second attempt: Explicit SSL true
        return {
          ...baseOptions,
          ssl: true,
          sslValidate: true,
        };

      case 3:
        // Third attempt: More permissive SSL
        return {
          ...baseOptions,
          ssl: true,
          sslValidate: false,
          tlsInsecure: true,
        };

      default:
        return baseOptions;
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

  // Check if MongoDB is disabled
  public isDisabled(): boolean {
    return this.disabled;
  }

  // Disable MongoDB completely (fallback mode)
  public disable(): void {
    this.disabled = true;
    this.connected = false;
    logger.log("MongoDB disabled - running in memory-only mode");

    if (this.client) {
      this.client
        .close()
        .catch((err) => logger.error("Error closing MongoDB connection:", err));
      this.client = null;
    }
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
