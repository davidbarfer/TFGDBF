import http from 'node:http';
import net from 'node:net';
import { processRequest } from './api.mjs';
import { processMatlabRequest, activeConnections } from './matlab.mjs';
import { launchMatlabClient } from './matlabFunctions.mjs';
import { generateFileSystem } from './fileSystem.mjs';

const server = http.createServer(processRequest);

server.listen(Number(process.env.BACKEND_PORT), '192.168.1.187', () => {
  console.log(`API server listening on: ${process.env.BACKEND_URL}`);
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

// Generate file system
generateFileSystem().catch(error => {
  console.error('Error generating file system:', error);
});
