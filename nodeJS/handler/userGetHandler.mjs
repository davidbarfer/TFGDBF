import { error } from 'node:console';
import { authenticate } from '../database.mjs';
import { query } from '../database.mjs';
import { getFileSubmission } from '../fileSystem.mjs';
import { roles } from '../utils.mjs';

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
    console.error('Database query error:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const getSubjectsUser = async (req, res, params) => {
  try {
    const decoded = await authenticate(req, res, true);
    const subjects_id = await query(
      'SELECT subject_id FROM users_subjects WHERE user_id = ?',
      [decoded.userId]
    );
    const subjects = await query('SELECT * FROM v_subject WHERE id IN (?)', [
      subjects_id.results.map(subject => subject.subject_id).flat(),
    ]);
    return res.end(JSON.stringify(subjects.results));
  } catch (error) {
    console.error('Database query error:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const getUsers = async (req, res, params) => {
  try {
    const users = await query('SELECT * FROM users');
    return res.end(JSON.stringify(users.results));
  } catch (error) {
    console.error('Database query error:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const getUsersProfessors = async (req, res, params) => {
  await authenticate(req, res);
  try {
    const professors = await query(
      'SELECT id, name, surname FROM users WHERE role = ?',
      [roles.professor]
    );
    if (professors.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'No professor found' }));
    }
    const professors_ids_arrays = professors.results
      .map(professor => professor.id)
      .flat();
    const user_subjects = await query(
      `SELECT user_id, subject_id from users_subjects WHERE user_id IN (${professors_ids_arrays.map(() => '?').join(',')})`,
      professors_ids_arrays
    );
    if (user_subjects.results.length !== 0) {
      professors.results.forEach(professor => {
        professor.subjects_id = user_subjects.results
          .filter(e => e.user_id === professor.id)
          .map(e => e.subject_id);
      });
    } else {
      professors.results.forEach(professor => {
        professor.subjects_id = [];
      });
    }
    res.statusCode = 200;
    res.end(JSON.stringify(professors.results));
  } catch (error) {
    console.error('Database query error:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const getSubject = async (req, res, params) => {
  const subject_id = params[0].split('/').pop();
  try {
    await authenticate(req, res, true);
    const subject = await query('SELECT * FROM v_subject WHERE id = ?', [
      subject_id,
    ]);
    if (subject.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Subject not found' }));
    }
    return res.end(JSON.stringify(subject.results[0]));
  } catch (error) {
    console.error('Database query error:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const getSubjectStudents = async (req, res, params) => {
  const subject_id_students = params[0].split('/')[2];
  try {
    await authenticate(req, res);
    const users_ids = await query(
      'SELECT user_id FROM users_subjects WHERE subject_id = ?',
      [subject_id_students]
    );
    if (users_ids.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Students not found' }));
    }
    const users_ids_array = users_ids.results.map(user => user.user_id).flat();
    const students = await query(
      `SELECT id, username, name, surname FROM users WHERE id IN (${users_ids_array.map(() => '?').join(',')}) AND role = "student"`,
      users_ids_array
    );
    if (students.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Students not found' }));
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
    console.error('Database query error on get students:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const getSubjectPractices = async (req, res, params) => {
  const subject_id_practices = params[0].split('/')[2];
  try {
    await authenticate(req, res, true);
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
    console.error('Database query error:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const getPractice = async (req, res, params) => {
  const practice_id = params[0].split('/').pop();
  try {
    await authenticate(req, res, true);
    const practice = await query('SELECT * FROM practice WHERE id = ?', [
      practice_id,
    ]);
    if (practice.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Practice not found' }));
    }
    return res.end(JSON.stringify(practice.results[0]));
  } catch (error) {
    console.error('Database query error on get practice:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const getPracticeSubmissions = async (req, res, params) => {
  const practice_id_submissions = params[0].split('/')[2];
  try {
    await authenticate(req, res);
    const submissions = await query(
      'SELECT id, user_id, practice_id, file_url, delivery_date, feedback, grade, evaluator_grade FROM submissions WHERE practice_id = ?',
      [practice_id_submissions]
    );
    if (submissions.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'User submissions not found' }));
    }
    await Promise.all(
      submissions.results.map(async (submission, idx) => {
        const user = await query(
          'SELECT id, username, name, surname FROM users WHERE id = ?',
          [submission.user_id]
        );
        submission.user = user.results[0];
        submissions.results[idx] = submission;
      })
    );
    res.statusCode = 200;
    return res.end(JSON.stringify(submissions.results));
  } catch (err) {
    console.error('Database query error on get submissions:', err);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
};
export const getSubjectPracticesGroups = async (req, res, params) => {
  const subject_id_practices_id_groups = {
    subject_id: params[0].split('/')[2],
    practice_id: params[0].split('/')[4],
  };
  try {
    await authenticate(req, res, true);
    const groups = await query(
      'SELECT pg.* FROM practice_groups pg JOIN practice p ON pg.practice_id = p.id WHERE pg.practice_id = ? AND p.subject_id = ?',
      [
        subject_id_practices_id_groups.practice_id,
        subject_id_practices_id_groups.subject_id,
      ]
    );
    if (groups.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Groups not found' }));
    }
    return res.end(JSON.stringify(groups.results));
  } catch (error) {
    console.error('Database query error on get groups:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const getGroup = async (req, res, params) => {
  const group_id = params[0].split('/').pop();
  try {
    await authenticate(req, res, true);
    const group = await query('SELECT * FROM practice_groups WHERE id = ?', [
      group_id,
    ]);
    if (group.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Group not found' }));
    }
    return res.end(JSON.stringify(group.results[0]));
  } catch (error) {
    console.error('Database query error on get group:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const getGroupStudents = async (req, res, params) => {
  const group_id_students = params[0].split('/')[2];
  try {
    await authenticate(req, res, true);
    const users_ids = await query(
      'SELECT user_id FROM practice_groups_users WHERE group_id = ?',
      [group_id_students]
    );
    if (users_ids.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Students not found' }));
    }
    const users_ids_array = users_ids.results.map(user => user.user_id).flat();
    const students = await query(
      `SELECT id, username, name, surname FROM users WHERE id IN (${users_ids_array.map(() => '?').join(',')}) AND role = "student"`,
      users_ids_array
    );
    if (students.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Students not found' }));
    }
    return res.end(JSON.stringify(students.results));
  } catch (error) {
    console.error('Database query error on get students:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const getStudentGroups = async (req, res, params) => {
  const student_id_groups = params[0].split('/')[2];
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
    console.error('Database query error on get groups:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const getStudentSubmissions = async (req, res, params) => {
  const student_id_submissions = params[0].split('/')[2];
  try {
    await authenticate(req, res, true);
    const submissions = await query(
      'SELECT * FROM submissions WHERE user_id = ?',
      [student_id_submissions]
    );
    if (submissions.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'User submissions not found' }));
    }
    await Promise.all(
      submissions.results.map(async (submission, idx) => {
        const practice = await query(
          'SELECT name, subject_id FROM practice WHERE id = ?',
          [submission.practice_id]
        );
        submission.practice_name = practice.results[0].name;
        submission.subject_id = practice.results[0].subject_id;
        submissions.results[idx] = submission;
      })
    );
    return res.end(JSON.stringify(submissions.results));
  } catch (error) {
    console.error('Database query error on get submissions:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const getStudentSubmission = async (req, res, params) => {
  const student_id_submission_id = {
    student_id: params[0].split('/')[2],
    submission_id: params[0].split('/')[4],
  };
  try {
    await authenticate(req, res, true);
    const submission = await query(
      'SELECT * FROM submissions WHERE user_id = ? AND id = ?',
      [
        student_id_submission_id.student_id,
        student_id_submission_id.submission_id,
      ]
    );
    if (submission.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Submission not found' }));
    }
    const practice = await query(
      'SELECT name, subject_id FROM practice WHERE id = ?',
      [submission.results[0].practice_id]
    );
    submission.results[0].practice_name = practice.results[0].name;
    submission.results[0].subject_id = practice.results[0].subject_id;
    return res.end(JSON.stringify(submission.results[0]));
  } catch (error) {
    console.error('Database query error on get submission:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const getStudentSubmissionFile = async (req, res, params) => {
  const student_id_submission_id_file = {
    student_id: params[0].split('/')[2],
    submission_id: params[0].split('/')[4],
  };
  try {
    await authenticate(req, res, true);
    const practice_id = await query(
      'SELECT practice_id FROM submissions WHERE id = ? AND user_id = ?',
      [
        student_id_submission_id_file.submission_id,
        student_id_submission_id_file.student_id,
      ]
    );
    if (practice_id.results[0].length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Practice not found' }));
    }
    const subject_id = await query(
      'SELECT subject_id FROM practice WHERE id = ?',
      [practice_id.results[0].practice_id]
    );
    if (subject_id.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Subject not found' }));
    }
    const url = `${subject_id.results[0].subject_id}/${practice_id.results[0].practice_id}/submissions/template.m`;
    const submissionFile = await getFileSubmission(
      url,
      params.student_id_submission_id_file
    );
    if (!submissionFile) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Submission file not found' }));
    }
    return res.end(JSON.stringify(submissionFile));
  } catch (error) {
    console.error('Database query error on get submission:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
export const getSubmission = async (req, res, params) => {
  const submission_id = params[0].split('/').pop();
  try {
    await authenticate(req, res, false);
    const submission = await query('SELECT * FROM submissions WHERE id = ?', [
      submission_id,
    ]);
    if (submission.results.length === 0) {
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Submission not found' }));
    }
    return res.end(JSON.stringify(submission.results[0]));
  } catch (error) {
    console.error('Database query error on get submission:', error);
    res.statusCode = 500;
    return res.end(JSON.stringify({ error: 'Internal server error' }));
  }
};
