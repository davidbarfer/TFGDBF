import http from 'node:http';
import { processRequest } from './api.mjs';

const server = http.createServer(processRequest);

server.listen(1234, () => {
  console.log('server listening on port http://localhost:1234');
});
