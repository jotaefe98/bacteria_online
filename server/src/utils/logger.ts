/**
 * Simple logger utility for development/production
 */
const isDevelopment = process.env.NODE_ENV === "development";

export const logger = {
  log: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(message, ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    console.error(message, ...args); // Always log errors
  },
  warn: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.warn(message, ...args);
    }
  },
};
