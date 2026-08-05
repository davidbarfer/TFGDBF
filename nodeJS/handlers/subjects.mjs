import {
  unhandledUserDefinedException,
  SERVER_ERRORS,
  SUBJECTS_ERRORS,
  SUBJECTS_SUCCESS,
} from '../utils/messages.mjs';
import { authenticate, query, checkSubjectStatus } from '../database.mjs';
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
      res.end({ error: SUBJECTS_ERRORS.subjectsNotFound });
    }
    return res.end(JSON.stringify(subjects.results));
  } catch (error) {
    logger.error('Error en la consulta a la base de datos en getSubjects:', {
      error: error.message,
      stack: error.stack,
    });
    res.statusCode = 500;
    return res.end(
      JSON.stringify({ error: SERVER_ERRORS.internalServerError })
    );
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
        JSON.stringify({ error: SUBJECTS_ERRORS.subjectNotFoundInUser })
      );
    }
    const subjects = await query('SELECT * FROM v_subject WHERE id IN (?)', [
      subjects_id.results.map(subject => subject.subject_id).flat(),
    ]);
    return res.end(JSON.stringify(subjects.results));
  } catch (error) {
    logger.error(
      'Error en la consulta a la base de datos en getSubjectsUser:',
      {
        error: error.message,
        stack: error.stack,
      }
    );
    res.statusCode = 500;
    return res.end(
      JSON.stringify({ error: SERVER_ERRORS.internalServerError })
    );
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
      return res.end(
        JSON.stringify({ error: SUBJECTS_ERRORS.subjectNotFound })
      );
    }
    return res.end(JSON.stringify(subject.results[0]));
  } catch (error) {
    logger.error('Error en la consulta a la base de datos en getSubject:', {
      error: error.message,
      stack: error.stack,
    });
    res.statusCode = error.statusCode || 500;
    return res.end(
      JSON.stringify({
        error: error.statusCode
          ? error.message
          : SERVER_ERRORS.internalServerError,
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
          JSON.stringify({ error: SUBJECTS_ERRORS.subjectDataRequired })
        );
      }
      try {
        const subject = await query(
          'INSERT INTO subject (name, course, degree_id) VALUES (?, ?, ?)',
          [data.name, data.course, data.degree]
        );
        if (subject.results.affectedRows === 0) {
          res.statusCode = 500;
          return res.end(
            JSON.stringify({ error: SERVER_ERRORS.internalServerError })
          );
        }
        const createSubjectFolder = await generateFolder(
          `${subject.results.insertId}`
        );
        if (createSubjectFolder === 500) {
          res.statusCode = 500;
          return res.end(
            JSON.stringify({ error: SERVER_ERRORS.internalServerError })
          );
        }
        res.statusCode = 201;
        return res.end(JSON.stringify(subject.results));
      } catch (error) {
        logger.error(
          'Error en la consulta a la base de datos en postSubjectCreate:',
          {
            error: error.message,
            stack: error.stack,
          }
        );
        if (error.sqlState === unhandledUserDefinedException) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: error.sqlMessage }));
        }
        res.statusCode = 500;
        return res.end(
          JSON.stringify({ error: SERVER_ERRORS.internalServerError })
        );
      }
    } catch {
      res.statusCode = 500;
      return res.end(
        JSON.stringify({ error: SERVER_ERRORS.internalServerError })
      );
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
    logger.info('Intentando eliminar asignatura', { subject_id });
    const result = await query(
      'UPDATE subject SET is_deleted = TRUE WHERE id = ?',
      [subject_id]
    );
    if (result.results.affectedRows > 0) {
      logger.info(SUBJECTS_SUCCESS.subjectDeleted, { subject_id });
      res.statusCode = 200;
      return res.end(
        JSON.stringify({ message: SUBJECTS_SUCCESS.subjectDeleted })
      );
    } else {
      logger.warn(
        'Error al eliminar la asignatura: No se ha encontrado el recurso',
        {
          subject_id,
        }
      );
      res.statusCode = 404;
      return res.end(
        JSON.stringify({ error: SUBJECTS_ERRORS.subjectNotFound })
      );
    }
  } catch (error) {
    logger.error('Error en la consulta a la base de datos en deleteSubject', {
      subject_id,
      error: error.message,
      stack: error.stack,
    });
    res.statusCode = 500;
    return res.end(
      JSON.stringify({ error: SERVER_ERRORS.internalServerError })
    );
  }
};
/**
 * Asignar una asignatura a un usuario
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
        return res.end({ error: SUBJECTS_ERRORS.subjectNotAffected });
      }
      res.statusCode = 201;
      return res.end(
        JSON.stringify({ message: SUBJECTS_SUCCESS.subjectAssigned })
      );
    } catch (error) {
      logger.error(
        'Error en la consulta a la base de datos en postUserSubject:',
        {
          error: error.message,
          stack: error.stack,
        }
      );
      res.statusCode = error.statusCode || 500;
      return res.end(
        JSON.stringify({
          error: error.statusCode
            ? error.message
            : SERVER_ERRORS.internalServerError,
        })
      );
    }
  });
};
/**
 * Desasignar una asignatura a un usuario
 */
export const deleteUserSubject = async (req, res, params) => {
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
        'DELETE FROM users_subjects WHERE user_id = ? AND subject_id = ?',
        [user_id_subject_id.user_id, user_id_subject_id.subject_id]
      );
      if (result.results.affectedRows === 0) {
        res.statusCode = 404;
        return res.end({ error: SUBJECTS_ERRORS.subjectNotAffected });
      }
      res.statusCode = 201;
      return res.end(
        JSON.stringify({ message: SUBJECTS_SUCCESS.subjectUnassigned })
      );
    } catch (error) {
      logger.error(
        'Error en la consulta a la base de datos en postUserSubject:',
        {
          error: error.message,
          stack: error.stack,
        }
      );
      res.statusCode = error.statusCode || 500;
      return res.end(
        JSON.stringify({
          error: error.statusCode
            ? error.message
            : SERVER_ERRORS.internalServerError,
        })
      );
    }
  });
};
