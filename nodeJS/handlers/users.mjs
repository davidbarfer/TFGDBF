import {
  unhandledUserDefinedException,
  SERVER_ERRORS,
  USERS_ERRORS,
  USERS_SUCCESS,
} from '../utils/messages.mjs';
import { authenticate, query, checkSubjectStatus } from '../database.mjs';
import { logger } from '../logger.mjs';
import { roles } from '../utils/utils.mjs';
/**
 * Returns all users
 */
export const getUsers = async (req, res, params) => {
  try {
    await authenticate(req, res);
    const users = await query('SELECT * FROM users');
    return res.end(JSON.stringify(users.results));
  } catch (error) {
    logger.error('Error en la consulta a la base de datos en getUsers:', {
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
 * Returns all users by a Role
 */
export const getUsersByRole = async (req, res, params) => {
  const roleMatch = req.url.match(/^\/users\/(\w+)$/)[1];
  await authenticate(req, res);
  try {
    const UsersByRole = await query(
      'SELECT id, username, name, surname, is_active FROM users WHERE role = ?',
      [roles[roleMatch]]
    );
    if (UsersByRole.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: USERS_ERRORS.userNotFound }));
    }
    const UsersByRole_ids_arrays = UsersByRole.results
      .map(professor => professor.id)
      .flat();
    const user_subjects = await query(
      `SELECT user_id, subject_id from users_subjects WHERE user_id IN (${UsersByRole_ids_arrays.map(() => '?').join(',')})`,
      UsersByRole_ids_arrays
    );
    if (user_subjects.results.length !== 0) {
      UsersByRole.results.forEach(professor => {
        professor.subjects_id = user_subjects.results
          .filter(e => e.user_id === professor.id)
          .map(e => e.subject_id);
      });
    } else {
      UsersByRole.results.forEach(professor => {
        professor.subjects_id = [];
      });
    }
    res.statusCode = 200;
    res.end(JSON.stringify(UsersByRole.results));
  } catch (error) {
    logger.error('Error en la consulta a la base de datos en getUsersByRole:', {
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
 * Return current/logged user
 */
export const getUserCurrent = async (req, res, params) => {
  const decodedUser = await authenticate(req, res, true);
  try {
    const currentUser = await query(
      'SELECT id, username, name, surname, is_active FROM users WHERE id = ?',
      [decodedUser.userId]
    );
    if (currentUser.results.length === 0) {
      res.statusCode = 404;
      res.end(JSON.stringify({ error: USERS_ERRORS.userNotFound }));
    }
    return res.end(JSON.stringify(currentUser.results[0]));
  } catch (error) {
    logger.error('Error en la consulta a la base de datos en getUserCurrent:', {
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
 * Returns all students of a subject
 */
export const getSubjectStudents = async (req, res, params) => {
  const subject_id_students = params[1];
  try {
    await authenticate(req, res);
    await checkSubjectStatus(subject_id_students);
    const users_ids = await query(
      'SELECT user_id FROM users_subjects WHERE subject_id = ?',
      [subject_id_students]
    );
    if (users_ids.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: USERS_ERRORS.userNotFound }));
    }
    const users_ids_array = users_ids.results.map(user => user.user_id).flat();
    const students = await query(
      `SELECT id, username, name, surname FROM users WHERE id IN (${users_ids_array.map(() => '?').join(',')}) AND role = "student"`,
      users_ids_array
    );
    if (students.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: USERS_ERRORS.userNotFound }));
    }
    const groups = await query(
      `SELECT * FROM practice_groups_users WHERE user_id IN (${students.results
        .map(student => student.id)
        .flat()
        .map(() => '?')
        .join(',')})`,
      students.results.map(student => student.id).flat()
    );
    students.results.forEach(student => {
      student.groups = groups.results
        .filter(group => group.user_id === student.id)
        .map(group => group.group_id);
    });
    return res.end(JSON.stringify(students.results));
  } catch (error) {
    logger.error(
      'Error en la consulta a la base de datos en getSubjectStudents:',
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
};
/**
 * Return all students from a group
 */
export const getGroupStudents = async (req, res, params) => {
  const group_id_students = params[1];
  try {
    await authenticate(req, res, true);
    const users_ids = await query(
      'SELECT user_id FROM practice_groups_users WHERE group_id = ?',
      [group_id_students]
    );
    if (users_ids.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: USERS_ERRORS.userNotFound }));
    }
    const users_ids_array = users_ids.results.map(user => user.user_id).flat();
    const students = await query(
      `SELECT id, username, name, surname FROM users WHERE id IN (${users_ids_array.map(() => '?').join(',')}) AND role = "student"`,
      users_ids_array
    );
    if (students.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: USERS_ERRORS.userNotFound }));
    }
    return res.end(JSON.stringify(students.results));
  } catch (error) {
    logger.error(
      'Error en la consulta a la base de datos en getGroupStudents:',
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
 * Activate an user
 */
export const updateUserStatus = async (req, res, params) => {
  const user_id = params[1];
  try {
    await authenticate(req, res);
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        if (!data) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({
              error: USERS_ERRORS.userDataRequired,
            })
          );
        }
        if (Number(data.id) != Number(user_id)) {
          res.statusCode = 404;
          return res.end(
            JSON.stringify({
              error: USERS_ERRORS.userDataRequired,
            })
          );
        }
        const result = await query(
          'UPDATE users SET is_active = ? WHERE id = ?',
          [data.status, user_id]
        );
        if (result.results.affectedRows === 0) {
          res.statusCode = 404;
          return res.end(
            JSON.stringify({ error: USERS_ERRORS.userNotAffected })
          );
        }
        res.statusCode = 200;
        res.end(JSON.stringify({ message: USERS_SUCCESS.userStatusUpdated }));
      } catch (error) {
        logger.error(
          'Error en la consulta a la base de datos en updateUserStatus:',
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
    });
  } catch (error) {
    logger.error(
      'Error en la consulta a la base de datos en updateUserStatus:',
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
