// logger.mjs
import path from 'node:path';
import winston from 'winston';
import 'winston-daily-rotate-file';
import { getFileSystemBasePath } from './fileSystem.mjs';

const BASE_PATH = getFileSystemBasePath();

const logFormat = winston.format.printf(
  ({ timestamp, level, message, stack, ...meta }) => {
    const metaString = Object.keys(meta).length
      ? ` | Meta: ${JSON.stringify(meta)}`
      : '';
    const stackString = stack ? `\n${stack}` : '';
    return `[${timestamp}] [${level.toUpperCase()}]: ${message}${metaString}${stackString}`;
  }
);

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    // 1. ROTATING ERROR LOGS
    new winston.transports.DailyRotateFile({
      filename: path.join(BASE_PATH, 'logs', 'error-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      zippedArchive: true, // Compresses old files into .gz to save massive disk space
      maxSize: '20m', // Forces rotation early if a file hits 20 Megabytes
      maxFiles: '14d', // AUTOMATICALLY REMOVES FILES OLDER THAN 14 DAYS
    }),

    // 2. ROTATING COMBINED LOGS
    new winston.transports.DailyRotateFile({
      filename: path.join(BASE_PATH, 'logs', 'combined-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '50m',
      maxFiles: '14d', // Keeps two weeks of history
    }),
  ],
});

// Console transport condition for development...
if (process.env.NODE_ENV !== 'production' && !process.argv.includes('--prod')) {
  const colorizer = winston.format.colorize();
  logger.add(
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.timestamp({ format: 'HH:mm:ss' }),
        winston.format.printf(
          ({ timestamp, level, message, stack, ...meta }) => {
            const metaString = Object.keys(meta).length
              ? ` | Meta: ${JSON.stringify(meta)}`
              : '';
            const stackString = stack ? `\n${stack}` : '';
            const rawMessage = `[${timestamp}] [${level.toUpperCase()}]: ${message}${metaString}${stackString}`;
            return colorizer.colorize(level, rawMessage);
          }
        )
      ),
    })
  );
}
