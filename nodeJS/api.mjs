import { router } from './router/router.mjs';
import { logger } from './logger.mjs';
import { SERVER_ERRORS } from './utils/messages.mjs';
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

  logger.info(`HTTP Request Received`, { method, url });
  // Find matching route
  const route = router.find(r => r.method === method && r.regex.test(url));
  if (!route) {
    res.statusCode = 404;
    logger.warn(SERVER_ERRORS.routeNotFound, { method, url });
    return res.end(JSON.stringify({ error: SERVER_ERRORS.routeNotFound }));
  }
  try {
    const params = url.match(route.regex);
    await route.handler(req, res, params);
  } catch (err) {
    // Write full execution context to error logs
    logger.error(`Router processing execution error`, {
      route: route.regex.toString(),
      method,
      url,
      error: err.message,
      stack: err.stack,
    });
    res.statusCode = 500;
    return res.end(
      JSON.stringify({ error: SERVER_ERRORS.internalServerError })
    );
  }
};
