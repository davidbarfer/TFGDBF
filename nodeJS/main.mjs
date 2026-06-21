import http from 'node:http';
import net from 'node:net';
import { processRequest } from './api.mjs';
import { processMatlabRequest, activeConnections } from './matlab.mjs';
import { launchMatlabClient } from './matlabFunctions.mjs';
import { generateFileSystem } from './fileSystem.mjs';

const isProduction = process.argv.includes('--prod');
console.log(
  `Server starting in [${isProduction ? 'PRODUCTION' : 'DEVELOPMENT'}] mode.`
);

const server = http.createServer(processRequest);

server.listen(Number(process.env.BACKEND_PORT), process.env.BASE_IP, () => {
  console.log(
    `API server listening on: http://${process.env.BASE_IP}:${process.env.BACKEND_PORT}`
  );
});

const matlabServer = net.createServer(processMatlabRequest);

// Start listening on a port
matlabServer.listen(Number(process.env.MATLAB_PORT), () => {
  console.log('TCP server listening on: ', matlabServer.address());
  // Check if MATLAB client is connected
  if (activeConnections.size === 0) {
    console.log('No MATLAB connection found, launching client...');
    try {
      launchMatlabClient();
    } catch (matlabError) {
      console.error('Failed to launch MATLAB:', matlabError);
    }
  }
});

if (isProduction) {
  generateFileSystem({ isProduction: true }).catch(error => {
    console.error('Production FS Error:', error);
  });
} else {
  generateFileSystem({ isProduction: false }).catch(error => {
    console.error('Development FS Error:', error);
  });
}
