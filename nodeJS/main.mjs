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
    `API server listening on: http://${process.env.BASE_IP}:${process.env.BACKEND_PORT}`
  );
});
generateFileSystem({ isProduction })
  .then(() => logger.info('File system generated sucessfully'))
  .catch(error => {
    logger.error(
      `${isProduction ? 'Production' : 'Development'} FS Initialization Error`,
      { error: error.message }
    );
  });
