// Simple test server to verify EC2 connectivity
const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  });
  
  const response = {
    status: 'success',
    message: 'EC2 server is accessible!',
    timestamp: new Date().toISOString(),
    port: process.env.PORT || 5000,
    ip: req.connection.remoteAddress
  };
  
  res.end(JSON.stringify(response, null, 2));
  console.log(`Request from ${req.connection.remoteAddress} at ${new Date()}`);
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`🔍 Test server running on port ${PORT}`);
  console.log(`Access at: http://YOUR_PUBLIC_IP:${PORT}`);
  console.log(`Listening on all interfaces (0.0.0.0:${PORT})`);
});