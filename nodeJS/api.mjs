import { routes } from './router/routes.mjs';
export const FRONTEND_URL = `http://${process.env.BASE_IP}:${process.env.FRONTEND_PORT}`;
export const BACKEND_URL = `http://${process.env.BASE_IP}:${process.env.BACKEND_PORT}`;
// CORS headers configuration
export const corsHeaders = {
  'Access-Control-Allow-Origin': `${FRONTEND_URL}`, // Your frontend URL
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true', // Crucial for cookies
  'Access-Control-Max-Age': 86400,
};

export const processRequest = async (req, res) => {
  const { method, url } = req;

  // Handle preflight requests
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      ...corsHeaders,
      'Content-Length': 0,
    });
    return res.end();
  }

  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  // Set respose
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  // Find matching route
  const route = routes.find(r => r.method === method && r.regex.test(url));
  if (!route) {
    res.statuscode = 404;
    return res.end(JSON.stringify({ error: 'Route not found' }));
  }
  try {
    const params = url.match(route.regex);
    await route.handler(req, res, params);
  } catch (err) {
    console.error(`[Router error]: ${err}`);
    res.statuscode = 500;
    return res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
};
