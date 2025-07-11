import { MongoClient, Db, Collection } from "mongodb";
import { GameAnalytics } from "../types/analytics";
import { logger } from "../utils/logger";
import * as fs from "fs";
import * as path from "path";

// Check if MongoDB is force-disabled
const mongoDisabledFile = path.join(__dirname, "../../.mongodb-disabled");
const isForceDisabled = fs.existsSync(mongoDisabledFile);

// MongoDB connection configuration - MEJORADA para SSL
const MONGODB_URI_RAW =
  process.env.MONGODB_URI || "mongodb://localhost:27017/bacteria_online";

// Asegurar parámetros SSL correctos para MongoDB Atlas SIN duplicar parámetros
const MONGODB_URI = MONGODB_URI_RAW.includes("mongodb+srv://")
  ? (() => {
      // Si ya tiene parámetros SSL, no los duplicar
      if (
        MONGODB_URI_RAW.includes("ssl=true") ||
        MONGODB_URI_RAW.includes("retryWrites=true")
      ) {
        return MONGODB_URI_RAW;
      }
      // Solo añadir si no existen
      return `${MONGODB_URI_RAW}${
        MONGODB_URI_RAW.includes("?") ? "&" : "?"
      }ssl=true&authSource=admin`;
    })()
  : MONGODB_URI_RAW;

const DATABASE_NAME = "bacteria_online";

class DatabaseManager {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private connected = false;
  private disabled = false;
  private connectionAttempts = 0;
  private maxConnectionAttempts = 5; // Reducir a 5 intentos para desactivar más rápido

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
          `✅ Successfully connected to MongoDB Atlas (attempt ${attempt})`
        );
        return;
      } catch (error) {
        logger.error(`❌ Connection attempt ${attempt} failed:`, error);

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
            if (this.connectionAttempts < this.maxConnectionAttempts) {
              logger.log("⏳ Attempting to reconnect to MongoDB...");
              this.connect();
            } else {
              logger.log(
                "🔄 Max connection attempts reached, disabling MongoDB..."
              );
              this.disable();
            }
          }, 60000); // 1 minute
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
    };

    // Try different SSL configurations based on attempt
    switch (attempt) {
      case 1:
        // First attempt: Minimal configuration - let MongoDB handle everything
        logger.log("🔄 Trying minimal configuration");
        return baseOptions;

      case 2:
        // Second attempt: Only TLS
        logger.log("🔄 Trying with TLS only");
        return {
          ...baseOptions,
          tls: true,
        };

      case 3:
        // Third attempt: Disable SSL validation (last resort)
        logger.log("🔄 Trying with TLS insecure");
        return {
          ...baseOptions,
          tls: true,
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
    return this.connected && !this.disabled;
  }

  public isDisabled(): boolean {
    return this.disabled;
  }

  public disable(): void {
    this.disabled = true;
    this.connected = false;
    logger.log("⚠️  MongoDB disabled - running in memory-only mode");

    if (this.client) {
      this.client
        .close()
        .catch((err) => logger.error("Error closing MongoDB connection:", err));
      this.client = null;
    }
  }

  public getDb(): Db | null {
    return this.db;
  }

  // Get games collection
  public getGamesCollection(): Collection<GameAnalytics> | null {
    if (!this.db || this.disabled) return null;
    return this.db.collection<GameAnalytics>("games");
  }

  // Reconnect if connection is lost
  public async ensureConnection(): Promise<boolean> {
    if (this.disabled) return false;

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
