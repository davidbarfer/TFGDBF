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
      filename: path.join(BASE_PATH, 'logs', 'error-%DATE%'),
      extension: '.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '14d',
    }),

    // 2. ROTATING COMBINED LOGS
    new winston.transports.DailyRotateFile({
      filename: path.join(BASE_PATH, 'logs', 'combined-%DATE%'),
      extension: '.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '50m',
      maxFiles: '14d',
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
