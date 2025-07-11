"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.databaseManager = void 0;
const mongodb_1 = require("mongodb");
const logger_1 = require("../utils/logger");
// MongoDB connection configuration
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/bacteria_online";
const DATABASE_NAME = "bacteria_online";
class DatabaseManager {
    constructor() {
        this.client = null;
        this.db = null;
        this.connected = false;
        this.connect();
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.client = new mongodb_1.MongoClient(MONGODB_URI);
                yield this.client.connect();
                this.db = this.client.db(DATABASE_NAME);
                this.connected = true;
                logger_1.logger.log("Successfully connected to MongoDB");
            }
            catch (error) {
                logger_1.logger.error("Failed to connect to MongoDB:", error);
                this.connected = false;
            }
        });
    }
    disconnect() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.client) {
                yield this.client.close();
                this.connected = false;
                logger_1.logger.log("Disconnected from MongoDB");
            }
        });
    }
    isConnected() {
        return this.connected;
    }
    getDb() {
        return this.db;
    }
    // Get games collection
    getGamesCollection() {
        if (!this.db)
            return null;
        return this.db.collection("games");
    }
    // Reconnect if connection is lost
    ensureConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.connected) {
                yield this.connect();
            }
            return this.connected;
        });
    }
}
exports.databaseManager = new DatabaseManager();
// Graceful shutdown
process.on("SIGINT", () => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.databaseManager.disconnect();
    process.exit(0);
}));
process.on("SIGTERM", () => __awaiter(void 0, void 0, void 0, function* () {
    yield exports.databaseManager.disconnect();
    process.exit(0);
}));
