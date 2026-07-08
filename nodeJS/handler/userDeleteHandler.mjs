import { authenticate, query, checkSubjectStatus } from '../database.mjs';
import { logger } from '../logger.mjs';
export const deleteGroup = async (req, res, params) => {
  const group_id = params[0].split('/').pop();
  try {
    await authenticate(req, res);
    logger.info('Attempting to delete group', { group_id });
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
      logger.info('Group deleted successfully', { group_id });
      res.statusCode = 200;
      return res.end(JSON.stringify({ message: 'Group deleted successfully' }));
    } else {
      logger.warn('Group deletion failed: Resource not found', { group_id });
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Group not found' }));
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
        error: error.statusCode ? error.message : 'Internal server error',
      })
    );
  }
};
export const deleteStudentGroup = async (req, res, params) => {
  const group_id_student_id = {
    group_id: params[0].split('/')[2],
    student_id: params[0].split('/')[4],
  };
  try {
    await authenticate(req, res);
    logger.info(
      'Attempting to delete a student from a group',
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
      logger.info(
        'Student deleted from group successfully',
        group_id_student_id
      );
      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          message: 'Student deleted from group successfully',
        })
      );
    } else {
      logger.warn('Student deletion from a group failed', group_id_student_id);
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Student not found in group' }));
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
        error: error.statusCode ? error.message : 'Internal server error',
      })
    );
  }
};
export const deleteSubject = async (req, res, params) => {
  const subject_id = params[0].split('/').pop();
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
