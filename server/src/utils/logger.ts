/**
 * Simple logger utility for development/production
 */
const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Safe JSON stringify that handles circular references and timers
 */
export const safeStringify = (obj: any, space?: number): string => {
  return JSON.stringify(
    obj,
    (key, value) => {
      // Skip circular references and timers
      if (
        key === "_idlePrev" ||
        key === "_idleNext" ||
        key === "domain" ||
        typeof value === "function"
      ) {
        return "[Circular/Timer]";
      }
      return value;
    },
    space
  );
};

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
