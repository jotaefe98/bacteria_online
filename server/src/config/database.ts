import { MongoClient, Db, Collection } from "mongodb";
import { GameAnalytics } from "../types/analytics";
import { logger } from "../utils/logger";

// MongoDB connection configuration - IMPROVED
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/bacteria_online";
const DATABASE_NAME = "bacteria_online";

// Detect if we're in production without MongoDB
const isProduction = process.env.NODE_ENV === "production";
const hasMongoUri = !!process.env.MONGODB_URI;

// Flag to disable MongoDB completely if it keeps failing
let mongoDisabled = false;

class DatabaseManager {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private connected = false;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3; // Solo 3 intentos, luego desactivar

  constructor() {
    logger.log("🔄 DatabaseManager initializing...");
    logger.log(
      `🔗 MongoDB URI: ${MONGODB_URI.replace(/\/\/.*@/, "//***:***@")}`
    ); // Hide credentials
    logger.log(`📊 Database Name: ${DATABASE_NAME}`);
    logger.log(`📁 Node Environment: ${process.env.NODE_ENV || "not set"}`);
    logger.log(`🌐 Production Mode: ${isProduction}`);
    logger.log(`🔑 MongoDB URI Provided: ${hasMongoUri}`);

    // Smart detection: if in production without MongoDB URI, disable immediately
    if (isProduction && !hasMongoUri) {
      logger.log("⚠️ Production environment detected without MongoDB URI");
      logger.log("🚫 Disabling MongoDB to prevent connection failures");
      mongoDisabled = true;
      return;
    }

    // Don't try to connect if MongoDB is disabled
    if (!mongoDisabled) {
      logger.log("🚀 Starting MongoDB connection process...");
      this.connect();
    } else {
      logger.log("⚠️ MongoDB is already disabled, skipping connection");
    }
  }

  private async connect(): Promise<void> {
    if (mongoDisabled) {
      logger.log("🚫 MongoDB is disabled - running in memory-only mode");
      return;
    }

    this.connectionAttempts++;

    logger.log(
      `🔄 MongoDB connection attempt ${this.connectionAttempts}/${this.maxConnectionAttempts}`
    );

    if (this.connectionAttempts > this.maxConnectionAttempts) {
      logger.log(
        "🔄 Max MongoDB connection attempts reached, disabling MongoDB permanently"
      );
      this.disableMongoDB();
      return;
    }

    try {
      logger.log(`� Attempting to connect to MongoDB...`);
      logger.log(
        `📍 Connection string: ${
          MONGODB_URI.split("@")[1] || "localhost connection"
        }`
      );

      // Use the simplest possible configuration with correct SSL options
      const options = {
        serverSelectionTimeoutMS: 10000, // 10 seconds
        connectTimeoutMS: 10000,
        socketTimeoutMS: 10000,
        tls: true, // Use tls instead of ssl
        retryWrites: true,
      };

      logger.log(`⚙️ Connection options: ${JSON.stringify(options)}`);

      this.client = new MongoClient(MONGODB_URI, options);

      logger.log("🔌 MongoClient created, attempting connection...");

      // Quick connection attempt
      await this.client.connect();
      logger.log("✅ MongoClient connected, testing with ping...");

      await this.client.db("admin").command({ ping: 1 });
      logger.log("🏓 MongoDB ping successful!");

      this.db = this.client.db(DATABASE_NAME);
      logger.log(`📊 Database '${DATABASE_NAME}' selected successfully`);

      this.connected = true;
      this.connectionAttempts = 0; // Reset on success
      logger.log("✅ MongoDB connected successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      const errorStack =
        error instanceof Error ? error.stack : "No stack trace";
      const errorName =
        error instanceof Error ? error.name : "Unknown error type";

      logger.log(
        `❌ MongoDB connection failed (attempt ${this.connectionAttempts})`
      );
      logger.log(`🔍 Error name: ${errorName}`);
      logger.log(`🔍 Error message: ${errorMessage}`);
      logger.log(`🔍 Error stack: ${errorStack}`);

      if (this.client) {
        logger.log("🔄 Attempting to close failed connection...");
        try {
          await this.client.close();
          logger.log("🔒 Failed connection closed successfully");
        } catch (closeError) {
          const closeErrorMessage =
            closeError instanceof Error
              ? closeError.message
              : "Unknown close error";
          logger.log(
            `⚠️ Error closing failed connection: ${closeErrorMessage}`
          );
        }
        this.client = null;
      }

      this.connected = false;

      // If we haven't reached max attempts, try again after a short delay
      if (this.connectionAttempts < this.maxConnectionAttempts) {
        logger.log(
          `⏳ Retrying connection in 5 seconds... (${this.connectionAttempts}/${this.maxConnectionAttempts})`
        );
        setTimeout(() => {
          this.connect();
        }, 5000); // 5 seconds
      } else {
        logger.log("🚫 Max connection attempts reached, disabling MongoDB");
        this.disableMongoDB();
      }
    }
  }

  private disableMongoDB(): void {
    mongoDisabled = true;
    this.connected = false;

    logger.log("🚫 MongoDB DISABLED - Game will run in memory-only mode");
    logger.log(
      "🎮 This does NOT affect gameplay - all features work normally!"
    );
    logger.log("📊 Only analytics will be lost (not critical for gameplay)");
    logger.log("🔄 Connection attempts: " + this.connectionAttempts);
    logger.log("⏰ Timestamp: " + new Date().toISOString());

    if (this.client) {
      logger.log("🔄 Closing MongoDB client...");
      this.client.close().catch((closeError) => {
        const closeErrorMessage =
          closeError instanceof Error
            ? closeError.message
            : "Unknown close error";
        logger.log(`⚠️ Error closing MongoDB client: ${closeErrorMessage}`);
      });
      this.client = null;
      logger.log("🔒 MongoDB client closed");
    }
  }

  public async disconnect(): Promise<void> {
    logger.log("🔄 Disconnecting from MongoDB...");

    if (this.client) {
      try {
        await this.client.close();
        this.connected = false;
        logger.log("✅ MongoDB disconnected successfully");
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        logger.log(`❌ Error during MongoDB disconnect: ${errorMessage}`);
      }
    } else {
      logger.log("⚠️ No MongoDB client to disconnect");
    }
  }

  public isConnected(): boolean {
    const connected = this.connected && !mongoDisabled;
    logger.log(
      `🔍 MongoDB connection status check: connected=${this.connected}, disabled=${mongoDisabled}, result=${connected}`
    );
    return connected;
  }

  public isDisabled(): boolean {
    logger.log(`🔍 MongoDB disabled status check: ${mongoDisabled}`);
    return mongoDisabled;
  }

  public getDb(): Db | null {
    logger.log(
      `🔍 Getting database instance: ${
        this.db ? "available" : "null"
      }, disabled=${mongoDisabled}`
    );
    return this.db;
  }

  public getGamesCollection(): Collection<GameAnalytics> | null {
    try {
      if (!this.db || mongoDisabled) {
        logger.log(
          `🔍 Cannot get games collection: db=${
            this.db ? "available" : "null"
          }, disabled=${mongoDisabled}`
        );
        return null;
      }

      const collection = this.db.collection<GameAnalytics>("games");
      logger.log(`✅ Games collection retrieved successfully`);
      return collection;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.log(`❌ Error getting games collection: ${errorMessage}`);
      return null;
    }
  }

  public async ensureConnection(): Promise<boolean> {
    logger.log(
      `🔄 Ensuring MongoDB connection... disabled=${mongoDisabled}, connected=${this.connected}`
    );

    if (mongoDisabled) {
      logger.log("🚫 MongoDB is disabled, cannot ensure connection");
      return false;
    }

    if (!this.connected) {
      logger.log("🔄 Not connected, attempting to connect...");
      await this.connect();
    }

    const result = this.connected;
    logger.log(`✅ Connection ensure result: ${result}`);
    return result;
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
