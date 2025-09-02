import { connectHandshake, errorHandshake } from './matlabFunctions.mjs';
export const activeConnections = new Set();
const handshakeMethods = new Set(['connect', 'evaluate']);
export const processMatlabRequest = socket => {
  console.log('MATLAB client connected');
  activeConnections.add(socket);

  // Set encoding to utf8
  socket.setEncoding('utf8');

  // Buffer for incoming data
  let buffer = '';

  // Handle data from MATLAB
  socket.on('error', error => {
    console.error('MATLAB client error:', error.message);
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
          console.log('Received from MATLAB:', request);
          // Handle different methods
          if (handshakeMethods.has(request.method)) {
            const response = connectHandshake(request);
            socket.write(JSON.stringify(response) + '\n');
          }
          // Add more method handlers as needed
        } catch (parseError) {
          console.error('Error parsing message:', msg, 'Error:', parseError);
          const errorResponse = errorHandshake;
          socket.write(JSON.stringify(errorResponse) + '\n');
        }
      }
    } catch (error) {
      console.error('Error processing data:', error);
    }
  });

  socket.on('end', () => {
    console.log('MATLAB client disconnected');
    activeConnections.delete(socket);
  });
};
