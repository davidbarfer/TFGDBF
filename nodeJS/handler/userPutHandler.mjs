import { authenticate, query } from '../database.mjs';
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
        console.error('Database query error on create submissions:', error);
        res.statusCode = 500;
        return res.end(JSON.stringify({ error: 'Internal server error' }));
      }
    });
  } catch (error) {
    console.error('Database query error on update grade:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const putPracticeSubmissionsGrade = async (req, res, params) => {
  try {
    await authenticate(req, res);
    throw new Error('API ENDPOINT PENDING TO BE DEVELOPED');
  } catch (error) {
    console.error('Database query error on update grade:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
