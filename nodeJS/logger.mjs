// logger.mjs
import winston from 'winston';
import path from 'node:path';
import { getFileSystemBasePath } from './fileSystem.mjs';

const BASE_PATH = getFileSystemBasePath();

const logFormat = winston.format.printf(
  ({ timestamp, level, message, ...meta }) => {
    const metaString = Object.keys(meta).length
      ? ` | Meta: ${JSON.stringify(meta)}`
      : '';
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}${metaString}`;
  }
);

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // 1. Write all errors down into error.log
    new winston.transports.File({
      filename: path.join(BASE_PATH, 'logs', 'error.log'),
      level: 'error',
    }),
    // 2. Write all logs (info & error) down into combined.log
    new winston.transports.File({
      filename: path.join(BASE_PATH, 'logs', 'combined.log'),
    }),
  ],
});

// Mirror clean logs to the console if running in development mode
if (process.env.NODE_ENV !== 'production' || !process.argv.includes('--prod')) {
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        logFormat
      ),
    })
  );
}
