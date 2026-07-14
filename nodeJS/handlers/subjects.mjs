import {
  authenticate,
  query,
  checkSubjectStatus,
  unhandledUserDefinedException,
} from '../database.mjs';
import { generateFolder } from '../fileSystem.mjs';
import { logger } from '../logger.mjs';
/**
 * Return all subjects
 */
export const getSubjects = async (req, res, params) => {
  try {
    await authenticate(req, res, true);
    const subjects = await query('SELECT * FROM v_subject');
    if (subjects.results.length === 0) {
      res.statusCode = 404;
      res.end({ error: 'Subjects not found' });
    }
    return res.end(JSON.stringify(subjects.results));
  } catch (error) {
    logger.error('Database query error on getSubjects:', {
      error: error.message,
      stack: error.stack,
    });
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
/**
 * Return all subjects from current/logged user
 */
export const getSubjectsUser = async (req, res, params) => {
  try {
    const decoded = await authenticate(req, res, true);
    const subjects_id = await query(
      'SELECT subject_id FROM users_subjects WHERE user_id = ?',
      [decoded.userId]
    );
    if (subjects_id.results.length === 0) {
      res.statusCode = 404;
      return res.end(
        JSON.stringify({ error: 'No subject found for this user' })
      );
    }
    const subjects = await query('SELECT * FROM v_subject WHERE id IN (?)', [
      subjects_id.results.map(subject => subject.subject_id).flat(),
    ]);
    return res.end(JSON.stringify(subjects.results));
  } catch (error) {
    logger.error('Database query error on getSubjectsUser:', {
      error: error.message,
      stack: error.stack,
    });
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
/**
 * Return a subject
 */
export const getSubject = async (req, res, params) => {
  const subject_id = params[1];
  try {
    await authenticate(req, res, true);
    await checkSubjectStatus(subject_id);
    const subject = await query('SELECT * FROM v_subject WHERE id = ?', [
      subject_id,
    ]);
    if (subject.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Subject not found' }));
    }
    return res.end(JSON.stringify(subject.results[0]));
  } catch (error) {
    logger.error('Database query error on getSubject:', {
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
 * Create a Subject
 */
export const postSubjectCreate = async (req, res, params) => {
  await authenticate(req, res);
  let body = '';
  req.on('data', chunk => {
    body += chunk.toString();
  });
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      if (!data.name || !data.course || !data.degree) {
        res.statusCode = 400;
        return res.end(
          JSON.stringify({ error: 'Name, course and degree are required.' })
        );
      }
      try {
        const subject = await query(
          'INSERT INTO subject (name, course, degree_id) VALUES (?, ?, ?)',
          [data.name, data.course, data.degree]
        );
        if (subject.results.affectedRows === 0) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Internal server error' }));
        }
        const createSubjectFolder = await generateFolder(
          `${subject.results.insertId}`
        );
        if (createSubjectFolder === 500) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Internal server error' }));
        }
        res.statusCode = 201;
        return res.end(JSON.stringify(subject.results));
      } catch (error) {
        logger.error('Database query error on postSubjectCreate:', {
          error: error.message,
          stack: error.stack,
        });
        if (error.sqlState === unhandledUserDefinedException) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: error.sqlMessage }));
        }
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    } catch {
      res.statusCode = 500;
      return res.end(JSON.stringify({ error: 'Internal server error' }));
    }
  });
};
/**
 * Delete a subject
 */
export const deleteSubject = async (req, res, params) => {
  const subject_id = params[1];
  try {
    await authenticate(req, res);
    logger.info('Attempting to delete subject', { subject_id });
    const result = await query(
      'UPDATE subject SET is_deleted = TRUE WHERE id = ?',
      [subject_id]
    );
    if (result.results.affectedRows > 0) {
      logger.info('Subject deleted successfully', { subject_id });
      res.statusCode = 200;
      return res.end(
        JSON.stringify({ message: 'Subject deleted successfully' })
      );
    } else {
      logger.warn('Subject deletion failed: Resource not found', {
        subject_id,
      });
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Group not found' }));
    }
  } catch (error) {
    logger.error('Database query error on deleteSubject', {
      subject_id,
      error: error.message,
      stack: error.stack,
    });
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
/**
 * Assign a subject to an user
 */
export const postUserSubject = async (req, res, params) => {
  await authenticate(req, res, false);
  const user_id_subject_id = {
    user_id: params[1],
    subject_id: params[2],
  };
  req.on('data', async () => {});
  req.on('end', async () => {
    try {
      await checkSubjectStatus(user_id_subject_id.subject_id);
      const result = await query(
        'INSERT INTO users_subjects (user_id, subject_id) VALUES (?, ?)',
        [user_id_subject_id.user_id, user_id_subject_id.subject_id]
      );
      if (result.results.affectedRows === 0) {
        res.statusCode = 404;
        return res.end({ error: 'Failed to assign subject' });
      }
      res.statusCode = 201;
      return res.end(
        JSON.stringify({ message: 'Subject assign succesfully ' })
      );
    } catch (error) {
      logger.error('Database query error on postUserSubject:', {
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
};
