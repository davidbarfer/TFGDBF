import mysql from 'mysql2/promise';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { logger } from './logger.mjs';
import { SERVER_ERRORS, SUBJECTS_ERRORS } from './utils/messages.mjs';
// Create the connection to database
export const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

export async function query(sql, params) {
  const [results, fields] = await connection.query(sql, params);
  return {
    results,
    fields,
  };
}

export async function hashPassword(password) {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

export const authProviders = {
  jwt: 'jwt',
  google: 'google',
  saml: 'smal',
};

export async function authenticate(req, res, student = false) {
  try {
    if (!req.headers.authorization) {
      res.statusCode = 401;
      return res.end(
        JSON.stringify({
          error: 'Unauthorized',
          message: SERVER_ERRORS.headersRequired,
        })
      );
    }
    const token = req.headers.authorization;
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!student) {
      if (decoded.role !== 'professor' && decoded.role !== 'admin') {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: SERVER_ERRORS.unauthorized }));
      }
    } else {
      if (
        decoded.role !== 'student' &&
        decoded.role !== 'professor' &&
        decoded.role !== 'admin'
      ) {
        res.statusCode = 401;
        return res.end(JSON.stringify({ error: SERVER_ERRORS.unauthorized }));
      }
    }
    return decoded;
  } catch (error) {
    logger.error('Erro de autenticación en authenticate:', {
      error: error.message,
      stack: error.stack,
    });
    res.statusCode = 500;
    return res.end(
      JSON.stringify({ error: SERVER_ERRORS.internalServerError })
    );
  }
}
export const checkSubjectStatus = async subject_id => {
  const check = await query('SELECT is_deleted FROM subject WHERE id = ?', [
    subject_id,
  ]);
  if (check.results.length === 0 || check.results[0].is_deleted) {
    const error = new Error(SUBJECTS_ERRORS.subjectDeletedNotFound);
    error.statusCode = 404;
    throw error;
  }
};
