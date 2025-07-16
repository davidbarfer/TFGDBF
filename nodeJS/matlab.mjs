function handleMatlabResponse(data) {
  console.log('Received from MATLAB:', data);
}
// Function to send data to MATLAB
function sendToMatlab(socket, data) {
  // You'll need to implement client connection logic here
  // or maintain persistent connections
  socket.write(data);
}
export const processMatlabRequest = socket => {
  console.log('MATLAB client connected');
  sendToMatlab(socket, 'Hello from Node.js');
  // Handle data from MATLAB
  socket.on('data', data => {
    const received = data.toString();
    // Process the response (you'll implement this)
    handleMatlabResponse(received);
  });

  socket.on('end', () => {
    console.log('MATLAB client disconnected');
  });
};
