import http from 'node:http';
import { processRequest } from './api.mjs';

const server = http.createServer(processRequest);

server.listen(Number(process.env.BACKEND_PORT), () => {
  console.log(
    `server listening on port http://localhost:${process.env.BACKEND_PORT}`
  );
});
