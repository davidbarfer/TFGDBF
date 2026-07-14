import path from 'node:path';
import { authenticate, checkSubjectStatus } from '../database.mjs';
import { query } from '../database.mjs';
import { generateFolder } from '../fileSystem.mjs';
import { logger } from '../logger.mjs';
/**
 * Return all practices from a subject
 */
export const getSubjectPractices = async (req, res, params) => {
  const subject_id_practices = params[1];
  try {
    await authenticate(req, res, true);
    await checkSubjectStatus(subject_id_practices);
    const practices = await query(
      'SELECT * FROM practice WHERE subject_id = ?',
      [subject_id_practices]
    );
    if (practices.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Practices not found' }));
    }
    return res.end(JSON.stringify(practices.results));
  } catch (error) {
    logger.error('Database query error on getSubjectPractices:', {
      error: error.message,
      stack: error.stack,
    });
    res.statusCode = error.statusCode || 500;
    return res.end(
      JSON.stringify({
        error: error.statusCode ? error.message : 'Internal server error',
      })
    );
  }
};
/**
 * Return a practice
 */
export const getPractice = async (req, res, params) => {
  const practice_id = params[1];
  try {
    await authenticate(req, res, true);
    const practice = await query('SELECT * FROM practice WHERE id = ?', [
      practice_id,
    ]);
    if (practice.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Practice not found' }));
    }
    await checkSubjectStatus(practice.results[0].subject_id);
    return res.end(JSON.stringify(practice.results[0]));
  } catch (error) {
    logger.error('Database query error on getPractice:', {
      error: error.message,
      stack: error.stack,
    });
    res.statusCode = error.statusCode || 500;
    return res.end(
      JSON.stringify({
        error: error.statusCode ? error.message : 'Internal server error',
      })
    );
  }
};
/**
 * Create a practice
 */
export const postPracticeCreate = async (req, res, params) => {
  const subject_id_practices = params[1];
  try {
    await authenticate(req, res);
    let body = '';

    // Collect request data
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        await checkSubjectStatus(subject_id_practices);
        // Parse and validate request body
        const data = JSON.parse(body);
        // Simple validation
        if (!data.name || !data.description) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({ error: 'Name and description are required' })
          );
        }
        const practice = await query(
          'INSERT INTO practice (subject_id, name, description, deadline) VALUES (?, ?, ?, ?)',
          [subject_id_practices, data.name, data.description, data.deadline]
        );
        if (practice.results.affectedRows === 0) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Internal server error' }));
        }
        const practiceUrl = path.join(
          String(subject_id_practices),
          String(practice.results.insertId)
        );
        try {
          await generateFolder(practiceUrl);
          await generateFolder(path.join(practiceUrl, 'evaluator'));
          await generateFolder(path.join(practiceUrl, 'submissions'));
        } catch (error) {
          logger.error('Generate Folder Error on postPracticeCreate:', {
            error: error.message,
            stack: error.stack,
          });
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Internal server error' }));
        }
        res.statusCode = 201;
        return res.end(JSON.stringify(practice.results));
      } catch (error) {
        logger.error('Database query error on postPracticeCreate:', {
          error: error.message,
          stack: error.stack,
        });
        res.statusCode = error.statusCode || 500;
        return res.end(
          JSON.stringify({
            error: error.statusCode ? error.message : 'Internal server error',
          })
        );
      }
    });
  } catch (error) {
    logger.error('Error checking subject ID on postPracticeCreate:', {
      error: error.message,
      stack: error.stack,
    });
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
