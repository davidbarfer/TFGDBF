import {
  unhandledUserDefinedException,
  SERVER_ERRORS,
  GROUPS_ERRORS,
  GROUPS_SUCCESS,
} from '../utils/messages.mjs';
import { authenticate, query, checkSubjectStatus } from '../database.mjs';
import { logger } from '../logger.mjs';
/**
 * Return a group
 */
export const getGroup = async (req, res, params) => {
  const group_id = params[1];
  try {
    await authenticate(req, res, true);
    const group = await query('SELECT * FROM practice_groups WHERE id = ?', [
      group_id,
    ]);
    if (group.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: GROUPS_ERRORS.groupNotFound }));
    }
    const practice = await query(
      'SELECT subject_id FROM practice WHERE id = ?',
      [group.results[0].practice_id]
    );
    if (practice.results.length > 0) {
      await checkSubjectStatus(practice.results[0].subject_id);
    }
    return res.end(JSON.stringify(group.results[0]));
  } catch (error) {
    logger.error('Database query error on getGroup:', {
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
 * Return all groups form a practice
 */
export const getSubjectPracticesGroups = async (req, res, params) => {
  const subject_id_practices_id_groups = {
    subject_id: params[1],
    practice_id: params[2],
  };
  try {
    await authenticate(req, res, true);
    await checkSubjectStatus(subject_id_practices_id_groups.subject_id);
    const groups = await query(
      'SELECT pg.* FROM practice_groups pg JOIN practice p ON pg.practice_id = p.id WHERE pg.practice_id = ? AND p.subject_id = ?',
      [
        subject_id_practices_id_groups.practice_id,
        subject_id_practices_id_groups.subject_id,
      ]
    );
    if (groups.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: GROUPS_ERRORS.groupsNotFound }));
    }
    return res.end(JSON.stringify(groups.results));
  } catch (error) {
    logger.error('Database query error on getSubjectPracticesGroups:', {
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
 * Return all groups of a user
 */
export const getStudentGroups = async (req, res, params) => {
  const student_id_groups = params[1];
  try {
    await authenticate(req, res, true);
    const groups_ids = await query(
      'SELECT group_id FROM practice_groups_users WHERE user_id = ?',
      [student_id_groups]
    );
    if (groups_ids.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Groups not found' }));
    }
    const groups = await query(
      'SELECT * FROM practice_groups WHERE id IN (?)',
      [groups_ids.results.map(group => group.group_id)]
    );
    if (groups.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Groups not found' }));
    }
    return res.end(JSON.stringify(groups.results));
  } catch (error) {
    logger.error('Database query error on getStudentGroups:', {
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
 * Create groups of a practice
 */
export const createGroups = async (req, res, params) => {
  try {
    await authenticate(req, res);
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        if (
          !data.groups ||
          !Array.isArray(data.groups) ||
          data.groups.length === 0
        ) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({ error: GROUPS_ERRORS.groupArrayRequired })
          );
        }
        const practiceCheck = await query(
          'SELECT subject_id FROM practice WHERE id = ?',
          [data.practice_id]
        );
        if (practiceCheck.results.length > 0) {
          await checkSubjectStatus(practiceCheck.results[0].subject_id);
        }
        const valuesPlaceholder = [];
        const flatValues = [];
        for (const g of data.groups) {
          if (
            !g.group_name ||
            !g.max_participants ||
            !g.group_date ||
            !g.start_time ||
            !g.end_time
          ) {
            res.statusCode = 400;
            return res.end(
              JSON.stringify({
                error: GROUPS_ERRORS.groupDataRequired,
              })
            );
          }
          if (g.description === '') {
            g.description = null;
          }
          valuesPlaceholder.push('(?, ?, ?, ?, ?, ?, ?)');
          flatValues.push(
            data.practice_id,
            g.group_name,
            g.description,
            g.max_participants,
            g.group_date,
            g.start_time,
            g.end_time
          );
        }
        const rawQuery = `
          INSERT INTO practice_groups 
          (practice_id, name, description, max_participants, practice_group_date, start_time, end_time) 
          VALUES ${valuesPlaceholder.join(', ')}
        `;
        const group = await query(rawQuery, flatValues);
        res.statusCode = 201;
        return res.end(
          JSON.stringify({ success: true, results: group.results })
        );
      } catch (error) {
        logger.error('Database query error on bulk postPracticeGroupsCreate:', {
          error: error.message,
          stack: error.stack,
        });
        if (error.sqlState === unhandledUserDefinedException) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: error.sqlMessage }));
        }
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
  } catch {
    res.statusCode = 500;
    return res.end(
      JSON.stringify({ error: SERVER_ERRORS.internalServerError })
    );
  }
};
/**
 * Add a user to a group
 */
export const postGroupStudent = async (req, res, params) => {
  try {
    await authenticate(req, res, true);
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        if (!data.group_id || !data.student_id) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({
              error: GROUPS_ERRORS.groupDataRequired,
            })
          );
        }
        const pathCheck = await query(
          'SELECT p.subject_id FROM practice_groups pg JOIN practice p ON pg.practice_id = p.id WHERE pg.id = ?',
          [data.group_id]
        );
        if (pathCheck.results.length > 0) {
          await checkSubjectStatus(pathCheck.results[0].subject_id);
        }
        const result = await query(
          'INSERT INTO practice_groups_users (group_id, user_id) VALUES (?, ?)',
          [data.group_id, data.student_id]
        );
        res.statusCode = 201;
        return res.end(JSON.stringify(result.results));
      } catch (error) {
        logger.error('Database query error on postGroupStudent:', {
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
    });
  } catch {
    res.statusCode = 500;
    return res.end(
      JSON.stringify({ error: SERVER_ERRORS.internalServerError })
    );
  }
};
/**
 * Delete a group
 */
export const deleteGroup = async (req, res, params) => {
  const group_id = params[1];
  try {
    await authenticate(req, res);
    logger.info('Intentando eliminar grupo', { group_id });
    const pathCheck = await query(
      'SELECT p.subject_id FROM practice_groups pg JOIN practice p ON pg.practice_id = p.id WHERE pg.id = ?',
      [group_id]
    );
    if (pathCheck.results.length > 0) {
      await checkSubjectStatus(pathCheck.results[0].subject_id);
    }
    const result = await query('DELETE FROM practice_groups WHERE id = ?', [
      group_id,
    ]);
    if (result.results.affectedRows > 0) {
      logger.info(GROUPS_SUCCESS.groupDeleted, { group_id });
      res.statusCode = 200;
      return res.end(JSON.stringify({ message: GROUPS_SUCCESS.groupDeleted }));
    } else {
      logger.warn('Fallo al eliminar grupo: Recurso no encontrado', {
        group_id,
      });
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: GROUPS_ERRORS.groupNotFound }));
    }
  } catch (error) {
    logger.error('Database query error on deleteGroup', {
      group_id,
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
 * Delete a student from a group
 */
export const deleteStudentGroup = async (req, res, params) => {
  const group_id_student_id = {
    group_id: params[1],
    student_id: params[2],
  };
  try {
    await authenticate(req, res);
    logger.info(
      'Intentando eliminar un alumno de un grupo',
      group_id_student_id
    );
    const pathCheck = await query(
      'SELECT p.subject_id FROM practice_groups pg JOIN practice p ON pg.practice_id = p.id WHERE pg.id = ?',
      [group_id_student_id.group_id]
    );
    if (pathCheck.results.length > 0) {
      await checkSubjectStatus(pathCheck.results[0].subject_id);
    }
    const result = await query(
      'DELETE FROM practice_groups_users WHERE group_id = ? AND user_id = ?',
      [group_id_student_id.group_id, group_id_student_id.student_id]
    );
    if (result.results.affectedRows > 0) {
      logger.info(GROUPS_SUCCESS.userDeletedFromGroup, group_id_student_id);
      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          message: GROUPS_SUCCESS.userDeletedFromGroup,
        })
      );
    } else {
      logger.warn('Error al eliminar alumno del grupo', group_id_student_id);
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: GROUPS_ERRORS.userNotFound }));
    }
  } catch (error) {
    logger.error('Database query error on deleteStudentGroup:', {
      group_id_student_id,
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
 * Edit a group
 */
export const updateGroup = async (req, res, params) => {
  const group_id = params[1];
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
              error: GROUPS_ERRORS.groupDataRequired,
            })
          );
        }
        if (data.description === '') {
          data.description = null;
        }
        const pathCheck = await query(
          'SELECT p.subject_id FROM practice_groups pg JOIN practice p ON pg.practice_id = p.id WHERE pg.id = ?',
          [group_id]
        );
        if (pathCheck.results.length > 0) {
          await checkSubjectStatus(pathCheck.results[0].subject_id);
        }
        const result = await query(
          'UPDATE practice_groups SET name = ?, description = ?, max_participants = ?, practice_group_date = ?, start_time = ?, end_time = ? WHERE id = ?',
          [
            data.name,
            data.description,
            data.max_participants,
            data.group_date,
            data.start_time,
            data.end_time,
            group_id,
          ]
        );
        if (result.results.affectedRows === 0) {
          res.statusCode = 404;
          return res.end(
            JSON.stringify({ error: GROUPS_ERRORS.groupNotAffected })
          );
        }
        res.statusCode = 200;
        res.end(JSON.stringify({ message: GROUPS_SUCCESS.groupUpdated }));
      } catch (error) {
        logger.error('Database query error on updateGroup:', {
          error: error.message,
          stack: error.stack,
        });
        if (error.sqlState === unhandledUserDefinedException) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: error.sqlMessage }));
        }
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
  } catch (error) {
    logger.error('Database query error on updateGroup:', {
      error: error.message,
      stack: error.stack,
    });
    res.statusCode = 500;
    return res.end(
      JSON.stringify({ error: SERVER_ERRORS.internalServerError })
    );
  }
};
