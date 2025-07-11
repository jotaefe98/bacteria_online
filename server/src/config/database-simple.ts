import { MongoClient, Db, Collection } from "mongodb";
import { GameAnalytics } from "../types/analytics";
import { logger } from "../utils/logger";

// MongoDB connection configuration - SIMPLE
const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/bacteria_online";
const DATABASE_NAME = "bacteria_online";

// Flag to disable MongoDB completely if it keeps failing
let mongoDisabled = false;

class DatabaseManager {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private connected = false;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 3; // Solo 3 intentos, luego desactivar

  constructor() {
    // Don't try to connect if MongoDB is disabled
    if (!mongoDisabled) {
      this.connect();
    }
  }

  private async connect(): Promise<void> {
    if (mongoDisabled) {
      logger.log("🚫 MongoDB is disabled - running in memory-only mode");
      return;
    }

    this.connectionAttempts++;

    if (this.connectionAttempts > this.maxConnectionAttempts) {
      logger.log(
        "🔄 Max MongoDB connection attempts reached, disabling MongoDB permanently"
      );
      this.disableMongoDB();
      return;
    }

    try {
      logger.log(
        `🔄 MongoDB connection attempt ${this.connectionAttempts}/${this.maxConnectionAttempts}`
      );

      // Use the simplest possible configuration
      const options = {
        serverSelectionTimeoutMS: 10000, // 10 seconds
        connectTimeoutMS: 10000,
        socketTimeoutMS: 10000,
      };

      this.client = new MongoClient(MONGODB_URI, options);

      // Quick connection attempt
      await this.client.connect();
      await this.client.db("admin").command({ ping: 1 });

      this.db = this.client.db(DATABASE_NAME);
      this.connected = true;
      this.connectionAttempts = 0; // Reset on success
      logger.log("✅ MongoDB connected successfully!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      logger.log(
        `❌ MongoDB connection failed (attempt ${this.connectionAttempts}): ${errorMessage}`
      );

      if (this.client) {
        try {
          await this.client.close();
        } catch (closeError) {
          // Ignore close errors
        }
        this.client = null;
      }

      this.connected = false;

      // If we haven't reached max attempts, try again after a short delay
      if (this.connectionAttempts < this.maxConnectionAttempts) {
        setTimeout(() => {
          this.connect();
        }, 5000); // 5 seconds
      } else {
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

    if (this.client) {
      this.client.close().catch(() => {
        // Ignore close errors
      });
      this.client = null;
    }
  }

  public async disconnect(): Promise<void> {
    if (this.client) {
      await this.client.close();
      this.connected = false;
      logger.log("MongoDB disconnected");
    }
  }

  public isConnected(): boolean {
    return this.connected && !mongoDisabled;
  }

  public isDisabled(): boolean {
    return mongoDisabled;
  }

  public getDb(): Db | null {
    return this.db;
  }

  public getGamesCollection(): Collection<GameAnalytics> | null {
    if (!this.db || mongoDisabled) return null;
    return this.db.collection<GameAnalytics>("games");
  }

  public async ensureConnection(): Promise<boolean> {
    if (mongoDisabled) return false;

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
