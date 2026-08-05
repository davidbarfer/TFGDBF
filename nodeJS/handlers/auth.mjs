import jwt from 'jsonwebtoken';
import { FRONTEND_URL, BACKEND_URL, corsHeaders } from '../api.mjs';
import {
  SERVER_ERRORS,
  AUTH_ERRORS,
  AUTH_SUCCESS,
} from '../utils/messages.mjs';
import {
  query,
  verifyPassword,
  hashPassword,
  authProviders,
} from '../database.mjs';
import { logger } from '../logger.mjs';
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
      logger.info('Inicio del proceso de autenticación');
      // Parse and validate request body
      let data;
      try {
        data = JSON.parse(body);
      } catch {
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: AUTH_ERRORS.jsonInvalid }));
      }

      // Simple validation
      if (!data.username || !data.password) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({
            error: AUTH_ERRORS.credentialsRequired,
          })
        );
      }

      // Find user by username
      const users = await query(
        'SELECT id, username, password, is_active, role FROM users WHERE username = ?',
        [data.username]
      );
      const user = users.results[0];

      if (!user) {
        logger.warn(AUTH_ERRORS.credentialsInvalid, {
          user,
          error: 'Usuario no encontrado en la base de datos',
        });
        res.statusCode = 401;
        return res.end(
          JSON.stringify({ error: AUTH_ERRORS.credentialsInvalid })
        );
      }

      // Verify password
      const isPasswordValid = await verifyPassword(
        data.password,
        user.password
      );
      if (!isPasswordValid) {
        logger.warn(AUTH_ERRORS.credentialsInvalid, {
          user,
          error: 'Contraseña no válida',
        });
        res.statusCode = 401;
        return res.end(
          JSON.stringify({ error: AUTH_ERRORS.credentialsInvalid })
        );
      }

      // Account active
      if (!user.is_active) {
        logger.warn(AUTH_ERRORS.accountPendingApproval, { user });
        res.statusCode = 403; // Forbidden
        return res.end(
          JSON.stringify({
            error: AUTH_ERRORS.accountPendingApproval,
          })
        );
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
      logger.info('Inicio de sesión realizado con éxito', user);
      res.writeHead(200, headers);
      return res.end(
        JSON.stringify({
          message: AUTH_SUCCESS.loginSuccessful,
          user: {
            id: user.id,
            username: user.username,
          },
        })
      );
    } catch (error) {
      logger.error('Error de inicio de sesión:', {
        error: error.message,
        stack: error.stack,
      });
      if (!res.headersSent) {
        res.statusCode = 500;
        res.end(JSON.stringify({ error: SERVER_ERRORS.internalServerError }));
      }
    }
  });

  // Handle request errors
  req.on('error', error => {
    if (requestComplete) return;
    requestComplete = true;
    logger.error('Error en la solicitud:', {
      error: error.message,
      stack: error.stack,
    });
    if (!res.headersSent) {
      res.statusCode = 500;
      res.end(JSON.stringify({ error: SERVER_ERRORS.internalServerError }));
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
  logger.info(AUTH_SUCCESS.logoutSuccessful);
  return res.end(JSON.stringify({ message: AUTH_SUCCESS.logoutSuccessful }));
};
export const signup = async (req, res, params) => {
  let body = '';

  // Collect request data
  req.on('data', chunk => {
    body += chunk.toString();
  });

  req.on('end', async () => {
    logger.info('Comienzo proceso de registro');
    try {
      // Parse and validate request body
      const data = JSON.parse(body);

      // JSON schema validation could be implemented here if needed

      // Simple validation
      if (!data.username || !data.password || !data.role) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({
            error: AUTH_ERRORS.credentialsRequired,
          })
        );
      }
      // Admin Creation not allow
      if (data.role === 'admin') {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({ error: AUTH_ERRORS.adminCreationNotAllowed })
        );
      }

      // Check if user already exists
      const existingUsers = await query(
        'SELECT * FROM users WHERE username = ?',
        [data.username]
      );
      if (existingUsers.results && existingUsers.results.length > 0) {
        logger.warn(AUTH_ERRORS.userAlreadyExists, existingUsers.results);
        res.statusCode = 409;
        return res.end(
          JSON.stringify({ error: AUTH_ERRORS.userAlreadyExists })
        );
      }

      const isActive = data.role === 'student' ? true : false;

      // Hash password
      const hashedPassword = await hashPassword(data.password);

      // Insert new user
      await query(
        'INSERT INTO users (username, password, password_salt, name, surname, role, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          data.username,
          hashedPassword,
          12,
          data.name,
          data.surname,
          data.role,
          isActive,
        ]
      );

      // Registration successful
      logger.info(AUTH_SUCCESS.signupSuccessful, data);
      res.statusCode = 201;
      return res.end(
        JSON.stringify({
          message:
            data.role === 'professor'
              ? AUTH_SUCCESS.signupSucessfulWaitingForAdminApproval
              : AUTH_SUCCESS.signupSuccessful,
          user: {
            username: data.username,
            role: data.role,
          },
        })
      );
    } catch (error) {
      logger.error('Error en registro:', {
        error: error.message,
        stack: error.stack,
      });
      res.statusCode = 500;
      return res.end(
        JSON.stringify({ error: SERVER_ERRORS.internalServerError })
      );
    }
  });
};
