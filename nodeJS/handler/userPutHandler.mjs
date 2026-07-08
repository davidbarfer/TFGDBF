import {
  authenticate,
  query,
  unhandledUserDefinedException,
  checkSubjectStatus,
} from '../database.mjs';
import { logger } from '../logger.mjs';
export const putStudentSubmissionGrade = async (req, res, params) => {
  const student_id_submission_id_grade = {
    student_id: params[0].split('/')[2],
    submission_id: params[0].split('/')[4],
  };
  try {
    await authenticate(req, res);
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        if (!data.submission_id || !data.evaluator_grade || !data.user_id) {
          res.statusCode = 400;
          return res.end(
            JSON.stringify({
              error: 'Submission ID or evaluator grade or user ID is missing',
            })
          );
        }
        if (
          Number(data.submission_id) !==
          Number(student_id_submission_id_grade.submission_id)
        ) {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Internal server error' }));
        }
        const subCheck = await query(
          'SELECT p.subject_id FROM submissions s JOIN practice p ON s.practice_id = p.id WHERE s.id = ?',
          [data.submission_id]
        );
        if (subCheck.results.length > 0) {
          await checkSubjectStatus(subCheck.results[0].subject_id);
        }
        const result = await query(
          'UPDATE submissions set grade = ? WHERE id = ? AND user_id = ?',
          [data.evaluator_grade, data.submission_id, data.user_id]
        );
        if (result.results.affectedRows === 0) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'No submissions affected' }));
        }
        res.statusCode = 204;
        return res.end(
          JSON.stringify({ message: 'Submission updated successfully' })
        );
      } catch (error) {
        logger.error('Database query error on putStudentSubmissionGrade:', {
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
    logger.error('Database query error on putStudentSubmissionGrade:', {
      error: error.message,
      stack: error.stack,
    });
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const putPracticeSubmissionsGrade = async (req, res, params) => {
  try {
    await authenticate(req, res);
    throw new Error('API ENDPOINT PENDING TO BE DEVELOPED');
  } catch (error) {
    logger.error('Database query error on putPracticeSubmissionsGrade:', {
      error: error.message,
      stack: error.stack,
    });
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const updateGroup = async (req, res, params) => {
  const group_id = params[0].split('/')[2];
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
              error: 'Group is not found',
            })
          );
        }
        const pathCheck = await query(
          'SELECT p.subject_id FROM practice_groups pg JOIN practice p ON pg.practice_id = p.id WHERE pg.id = ?',
          [group_id]
        );
        if (pathCheck.results.length > 0) {
          await checkSubjectStatus(pathCheck.results[0].subject_id);
        }
        const result = await query(
          'UPDATE practice_groups SET name = ?, max_participants = ?, practice_group_date = ?, start_time = ?, end_time = ? WHERE id = ?',
          [
            data.name,
            data.max_participants,
            data.group_date,
            data.start_time,
            data.end_time,
            group_id,
          ]
        );
        if (result.results.affectedRows === 0) {
          res.statusCode = 404;
          return res.end(JSON.stringify({ error: 'No submissions affected' }));
        }
        res.statusCode = 200;
        res.end(JSON.stringify({ message: 'Group have been updated' }));
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
            error: error.statusCode ? error.message : 'Internal server error',
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
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const updateUserStatus = async (req, res, params) => {
  const user_id = params[0].split('/')[2];
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
              error: 'Data required',
            })
          );
        }
        if (Number(data.id) != Number(user_id)) {
          res.statusCode = 404;
          return res.end(
            JSON.stringify({
              error: 'User on URL and User on body does not match',
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
            JSON.stringify({ error: 'User have not been updated' })
          );
        }
        res.statusCode = 200;
        res.end(JSON.stringify({ message: 'User status have been updated' }));
      } catch (error) {
        logger.error('Database query error on updateUserStatus:', {
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
    });
  } catch (error) {
    logger.error('Database query error on updateUserStatus:', {
      error: error.message,
      stack: error.stack,
    });
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
