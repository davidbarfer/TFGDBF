import { logger } from './logger.mjs';
import { connectHandshake, errorHandshake } from './matlabFunctions.mjs';
export const activeConnections = new Set();
const handshakeMethods = new Set(['connect', 'evaluate']);
export const processMatlabRequest = socket => {
  logger.info('MATLAB client connected');
  activeConnections.add(socket);

  // Set encoding to utf8
  socket.setEncoding('utf8');

  // Buffer for incoming data
  let buffer = '';

  // Handle data from MATLAB
  socket.on('error', error => {
    logger.error('MATLAB client error:', {
      error: error.message,
      stack: error.stack,
    });
    activeConnections.delete(socket);
  });

  socket.on('data', data => {
    try {
      buffer += data;

      // Process complete messages (ending with newline)
      const messages = buffer.split('\n');
      buffer = messages.pop() || ''; // Keep incomplete message in buffer

      for (const msg of messages) {
        if (!msg.trim()) continue;

        try {
          const request = JSON.parse(msg);
          logger.info('Received from MATLAB:', request);
          // Handle different methods
          if (handshakeMethods.has(request.method)) {
            const response = connectHandshake(request);
            socket.write(JSON.stringify(response) + '\n');
          }
          // Add more method handlers as needed
        } catch (parseError) {
          logger.error(`Error parsing message: ${msg}`, {
            error: parseError.message,
            stack: parseError.stack,
          });
          const errorResponse = errorHandshake;
          socket.write(JSON.stringify(errorResponse) + '\n');
        }
      }
    } catch (error) {
      logger.error('Error processing data:', {
        error: error.message,
        stack: error.stack,
      });
    }
  });

  socket.on('end', () => {
    logger.info('MATLAB client disconnected');
    activeConnections.delete(socket);
  });
};
