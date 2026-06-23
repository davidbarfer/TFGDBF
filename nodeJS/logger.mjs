// logger.mjs
import winston from 'winston';
import path from 'node:path';
import { getFileSystemBasePath } from './fileSystem.mjs';

const BASE_PATH = getFileSystemBasePath();

// Formato base para los archivos (sin colores ANSI para que no ensucien los archivos .log)
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
    new winston.transports.File({
      filename: path.join(BASE_PATH, 'logs', 'error.log'),
      level: 'error',
    }),
    new winston.transports.File({
      filename: path.join(BASE_PATH, 'logs', 'combined.log'),
    }),
  ],
});

if (process.env.NODE_ENV !== 'production' || !process.argv.includes('--prod')) {
  // Instanciamos el colorizador de Winston para usarlo manualmente dentro del printf
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

            // 1. Creamos la línea de log estándar en texto plano
            const rawMessage = `[${timestamp}] [${level.toUpperCase()}]: ${message}${metaString}${stackString}`;

            // 2. Le pasamos el nivel actual ('info', 'error', 'warn') al colorizer
            // para que envuelva TODO el mensaje en el color correcto
            return colorizer.colorize(level, rawMessage);
          }
        )
      ),
    })
  );
}
