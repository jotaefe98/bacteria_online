"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
/**
 * Simple logger utility for development/production
 */
const isDevelopment = process.env.NODE_ENV === "development";
exports.logger = {
    log: (message, ...args) => {
        if (isDevelopment) {
            console.log(message, ...args);
        }
    },
    error: (message, ...args) => {
        console.error(message, ...args); // Always log errors
    },
    warn: (message, ...args) => {
        if (isDevelopment) {
            console.warn(message, ...args);
        }
    },
};
