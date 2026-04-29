import { authenticate, query } from '../database.mjs';
export const deleteGroup = async (req, res, params) => {
  const group_id = params[0].split('/').pop();
  try {
    await authenticate(req, res);
    const result = await query('DELETE FROM practice_groups WHERE id = ?', [
      group_id,
    ]);
    if (result.results.affectedRows > 0) {
      res.statusCode = 200;
      return res.end(JSON.stringify({ message: 'Group deleted successfully' }));
    } else {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Group not found' }));
    }
  } catch (error) {
    console.error('Database query error:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const deleteStudentGroup = async (req, res, params) => {
  const group_id_student_id = {
    group_id: params[0].split('/')[2],
    student_id: params[0].split('/')[4],
  };
  try {
    await authenticate(req, res);
    const result = await query(
      'DELETE FROM practice_groups_users WHERE group_id = ? AND user_id = ?',
      [group_id_student_id.group_id, group_id_student_id.student_id]
    );
    if (result.results.affectedRows > 0) {
      res.statusCode = 200;
      return res.end(
        JSON.stringify({
          message: 'Student deleted from group successfully',
        })
      );
    } else {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Student not found in group' }));
    }
  } catch (error) {
    console.error('Database query error:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
