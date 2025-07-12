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

/**
 * Get current timestamp for logging
 */
const getTimestamp = (): string => {
  return new Date().toISOString();
};

/**
 * Format log message with timestamp
 */
const formatMessage = (level: string, message: string): string => {
  return `[${getTimestamp()}] [${level}] ${message}`;
};

export const logger = {
  log: (message: string, ...args: any[]) => {
    // Always log important messages (those starting with emojis indicating status)
    const isImportant = message.match(
      /^[🔄🚀📊✅❌⚠️🔍🏥🔌📁🌐⏰🚫🎮🔗📍⚙️🔌🏓🔒🔄⏳🔄]/
    );

    if (isDevelopment || isImportant) {
      console.log(formatMessage("INFO", message), ...args);
    }
  },
  error: (message: string, ...args: any[]) => {
    console.error(formatMessage("ERROR", message), ...args); // Always log errors
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(formatMessage("WARN", message), ...args); // Always log warnings
  },
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.debug(formatMessage("DEBUG", message), ...args);
    }
  },
  info: (message: string, ...args: any[]) => {
    console.info(formatMessage("INFO", message), ...args); // Always log info
  },
};
