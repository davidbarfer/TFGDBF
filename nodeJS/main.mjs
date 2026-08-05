import http from 'node:http';
import { logger } from './logger.mjs';
import { processRequest } from './api.mjs';
import { generateFileSystem } from './fileSystem.mjs';

const isProduction = process.argv.includes('--prod');
logger.info(
  `Server starting mode: ${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}`
);

const server = http.createServer(processRequest);

server.listen(Number(process.env.BACKEND_PORT), process.env.BASE_IP, () => {
  logger.info(
    `Servidor API escuchando en: http://${process.env.BASE_IP}:${process.env.BACKEND_PORT}`
  );
});
generateFileSystem({ isProduction })
  .then(() =>
    logger.info('El sistema de archivos se ha generado correctamente')
  )
  .catch(error => {
    logger.error(
      `Error de inicialización del sistema de archivos en ${isProduction ? 'Producción' : 'Desarrollo'}`,
      { error: error.message }
    );
  });
