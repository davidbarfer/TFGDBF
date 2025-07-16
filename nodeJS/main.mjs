import http from 'node:http';
import net from 'node:net';
import { processRequest } from './api.mjs';
import { processMatlabRequest } from './matlab.mjs';

const server = http.createServer(processRequest);

server.listen(Number(process.env.BACKEND_PORT), () => {
  console.log(
    `API server listening on: http://localhost:${process.env.BACKEND_PORT}`
  );
});

const matlabServer = net.createServer(processMatlabRequest);

// Start listening on a port
matlabServer.listen(Number(process.env.MATLAB_PORT), () => {
  console.log('TCP server listening on: ', matlabServer.address());
});
