import http from 'node:http';
import net from 'node:net';
import { logger } from './logger.mjs';
import { processRequest } from './api.mjs';
import { processMatlabRequest, activeConnections } from './matlab.mjs';
import { launchMatlabClient } from './matlabFunctions.mjs';
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

const matlabServer = net.createServer(processMatlabRequest);

// Start listening on a port
matlabServer.listen(Number(process.env.MATLAB_PORT), () => {
  logger.info(`TCP server listening on: ${process.env.MATLAB_PORT}`);
  // Check if MATLAB client is connected
  if (activeConnections.size === 0) {
    logger.warn('No MATLAB connection found, launching client...');
    try {
      launchMatlabClient();
    } catch (matlabError) {
      logger.error('Failed to launch MATLAB:', { error: matlabError });
    }
  }
});
generateFileSystem({ isProduction })
  .then(() => logger.info('File system generated sucessfully'))
  .catch(error => {
    logger.error(
      `${isProduction ? 'Production' : 'Development'} FS Initialization Error`,
      { error: error.message }
    );
  });
