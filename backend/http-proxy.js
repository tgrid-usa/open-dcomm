const http = require('http');
const https = require('https');
const httpProxy = require('http-proxy');

// Create a proxy server with certificate handling
const proxy = httpProxy.createProxyServer({
  target: {
    protocol: 'https:',
    host: 'localhost',
    port: 8443
  },
  // Handle self-signed certificates
  secure: false,
  // Change origin to handle CORS
  changeOrigin: true,
  // SSL/TLS options
  ssl: {
    rejectUnauthorized: false
  },
  // Additional options to handle various HTTP scenarios
  ws: true, // Enable WebSocket proxying
  xfwd: true // Add X-Forwarded headers
});

// Handle proxy errors
proxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (!res.headersSent) {
    res.writeHead(502, {
      'Content-Type': 'application/json'
    });
  }
  res.end(JSON.stringify({
    error: 'Proxy Error',
    message: err.message
  }));
});

// Log proxy events for debugging
proxy.on('proxyReq', (proxyReq, req, res) => {
  console.log(`Proxying ${req.method} request to: ${req.url}`);
});

proxy.on('proxyRes', (proxyRes, req, res) => {
  console.log(`Received response from target: ${proxyRes.statusCode}`);
});

// Create the server
const server = http.createServer((req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
  
  // Handle OPTIONS method for CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  proxy.web(req, res);
});

// Error handling for the server itself
server.on('error', (err) => {
  console.error('Server error:', err);
});

// Start the server
const PORT = 8000;
server.listen(PORT, () => {
  console.log(`Reverse proxy running on port ${PORT} -> forwarding to 8443`);
  console.log('Self-signed certificate handling enabled');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM. Performing graceful shutdown...');
  server.close(() => {
    console.log('Server closed. Exiting process.');
    process.exit(0);
  });
});