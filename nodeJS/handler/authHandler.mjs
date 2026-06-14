import jwt from 'jsonwebtoken';
import { FRONTEND_URL, BACKEND_URL, corsHeaders } from '../api.mjs';
import {
  query,
  verifyPassword,
  hashPassword,
  authProviders,
} from '../database.mjs';
export const login = async (req, res, params) => {
  let body = '';
  let requestComplete = false;

  // Handle request data
  req.on('data', chunk => {
    if (requestComplete) return;
    body += chunk.toString();
  });

  req.on('end', async () => {
    if (requestComplete) return;
    requestComplete = true;

    try {
      // Parse and validate request body
      let data;
      try {
        data = JSON.parse(body);
      } catch {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({ error: 'Invalid JSON in request body' })
        );
      }

      // Simple validation
      if (!data.username || !data.password) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({
            error: 'Username and password are required',
          })
        );
      }

      // Find user by username
      const users = await query('SELECT * FROM users WHERE username = ?', [
        data.username,
      ]);
      const user = users.results[0];

      if (!user) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: 'Invalid credentials' }));
      }

      // Verify password
      const isPasswordValid = await verifyPassword(
        data.password,
        user.password
      );
      if (!isPasswordValid) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: 'Invalid credentials' }));
      }

      // Generate token
      const token = jwt.sign(
        {
          userId: user.id,
          authMethod: authProviders.jwt,
          role: user.role,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: '1h',
          issuer: `${BACKEND_URL}`,
        }
      );

      // Set response headers
      const headers = {
        'Content-Type': 'application/json',
        'Set-Cookie': `token=${token}; HttpOnly; Max-Age=3600; Path=/`,
        'Access-Control-Allow-Origin': `${FRONTEND_URL}`,
        'Access-Control-Allow-Credentials': 'true',
      };

      // Send successful response
      res.writeHead(200, headers);
      return res.end(
        JSON.stringify({
          message: 'Login successful',
          user: {
            id: user.id,
            username: user.username,
          },
        })
      );
    } catch (error) {
      console.error('Login error:', error);
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    }
  });

  // Handle request errors
  req.on('error', error => {
    if (requestComplete) return;
    requestComplete = true;
    console.error('Request error:', error);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Error processing request' }));
    }
  });

  return; // Prevent further execution
};
export const logout = async (req, res, params) => {
  // Clean HttpOnly cookie
  res.writeHead(200, {
    ...corsHeaders,
    'Content-Type': 'application/json',
    'Set-Cookie': `token=; HttpOnly; Max-Age=0; Path=/`,
  });
  return res.end(JSON.stringify({ message: 'Logout successful' }));
};
export const signup = async (req, res, params) => {
  let body = '';

  // Collect request data
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    try {
      // Parse and validate request body
      const data = JSON.parse(body);

      // JSON schema validation could be implemented here if needed

      // Simple validation
      if (!data.username || !data.password || !data.role) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({
            error: 'Username, password, and role are required',
          })
        );
      }
      // Admin Creation not allow
      if (data.role === 'admin') {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: 'Admin creation not allowed' }));
      }

      // Check if user already exists
      const existingUsers = await query(
        'SELECT * FROM users WHERE username = ?',
        [data.username]
      );
      if (existingUsers.results && existingUsers.results.length > 0) {
        res.statusCode = 409;
        return res.end(JSON.stringify({ error: 'User already exists' }));
      }

      // Hash password
      const hashedPassword = await hashPassword(data.password);

      // Insert new user
      await query(
        'INSERT INTO users (username, password, password_salt, name, surname, role) VALUES (?, ?, ?, ?, ?, ?)',
        [data.username, hashedPassword, 12, data.name, data.surname, data.role]
      );

      // Registration successful
      res.statusCode = 201;
      return res.end(
        JSON.stringify({
          message: 'User registered successfully',
          user: {
            username: data.username,
            role: data.role,
          },
        })
      );
    } catch (error) {
      console.error('Registration error:', error);
      res.statusCode = 500;
      return res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  });
};
