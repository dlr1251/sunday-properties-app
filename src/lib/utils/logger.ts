import { logError as baseLogError } from '../error';

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

// Logger configuration
interface LoggerConfig {
  level: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
}

const config: LoggerConfig = {
  level: import.meta.env.DEV ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableRemote: !import.meta.env.DEV,
};

// Log entry interface
interface LogEntry {
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  timestamp: string;
  userId?: string;
  sessionId?: string;
}

// Create log entry
function createLogEntry(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
): LogEntry {
  return {
    level,
    message,
    context,
    timestamp: new Date().toISOString(),
    userId: getCurrentUserId(),
    sessionId: getCurrentSessionId(),
  };
}

// Get current user ID from localStorage or context
function getCurrentUserId(): string | undefined {
  try {
    const authData = localStorage.getItem('supabase.auth.token');
    if (authData) {
      const parsed = JSON.parse(authData);
      return parsed?.user?.id;
    }
  } catch {
    // Ignore parsing errors
  }
  return undefined;
}

// Get current session ID
function getCurrentSessionId(): string | undefined {
  try {
    return sessionStorage.getItem('sessionId') || undefined;
  } catch {
    return undefined;
  }
}

// Format log entry for console
function formatForConsole(entry: LogEntry): string {
  const levelName = LogLevel[entry.level];
  const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';
  return `[${entry.timestamp}] ${levelName}: ${entry.message}${contextStr}`;
}

// Send log to remote service (placeholder)
async function sendToRemote(entry: LogEntry): Promise<void> {
  if (!config.enableRemote) return;

  try {
    // In a real app, you'd send this to your logging service
    // For now, we'll just store in localStorage for debugging
    const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
    logs.push(entry);
    
    // Keep only last 100 logs
    if (logs.length > 100) {
      logs.splice(0, logs.length - 100);
    }
    
    localStorage.setItem('app_logs', JSON.stringify(logs));
  } catch (error) {
    console.error('Failed to send log to remote:', error);
  }
}

// Core logging function
function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  if (level < config.level) return;

  const entry = createLogEntry(level, message, context);

  if (config.enableConsole) {
    const formatted = formatForConsole(entry);
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formatted);
        break;
      case LogLevel.INFO:
        console.info(formatted);
        break;
      case LogLevel.WARN:
        console.warn(formatted);
        break;
      case LogLevel.ERROR:
        console.error(formatted);
        break;
    }
  }

  // Send to remote asynchronously
  sendToRemote(entry).catch(() => {
    // Ignore remote logging errors
  });
}

// Public logging functions
export function logDebug(message: string, context?: Record<string, unknown>): void {
  log(LogLevel.DEBUG, message, context);
}

export function logInfo(message: string, context?: Record<string, unknown>): void {
  log(LogLevel.INFO, message, context);
}

export function logWarn(message: string, context?: Record<string, unknown>): void {
  log(LogLevel.WARN, message, context);
}

export function logError(message: string, context?: Record<string, unknown>): void {
  log(LogLevel.ERROR, message, context);
}

// Enhanced error logging with stack traces
export function logErrorWithStack(
  message: string,
  error: Error,
  context?: Record<string, unknown>
): void {
  logError(message, {
    ...context,
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
  });
}

// Performance logging
export function logPerformance(
  operation: string,
  duration: number,
  context?: Record<string, unknown>
): void {
  logInfo(`Performance: ${operation} took ${duration}ms`, {
    operation,
    duration,
    ...context,
  });
}

// API call logging
export function logApiCall(
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  context?: Record<string, unknown>
): void {
  const level = statusCode >= 400 ? LogLevel.ERROR : LogLevel.INFO;
  log(level, `API ${method} ${url} - ${statusCode} (${duration}ms)`, {
    method,
    url,
    statusCode,
    duration,
    ...context,
  });
}

// Re-export the original logError for backward compatibility
export { baseLogError };

// Set log level
export function setLogLevel(level: LogLevel): void {
  config.level = level;
}

// Enable/disable console logging
export function setConsoleLogging(enabled: boolean): void {
  config.enableConsole = enabled;
}

// Enable/disable remote logging
export function setRemoteLogging(enabled: boolean): void {
  config.enableRemote = enabled;
}
