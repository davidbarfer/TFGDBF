import jwt from 'jsonwebtoken';
import { query, hashPassword, verifyPassword } from './database.mjs';
import {
  authProviders,
  authenticate,
  unhandledUserDefinedException,
} from './database.mjs';
import { getFileSubmission, saveFileSubmission } from './fileSystem.mjs';
import {
  getSubject,
  getSubjectPractices,
  getSubjectPracticesGroups,
  getGroup,
  getGroupStudents,
  getSubjectStudents,
  getPractice,
  getPracticeSubmissions,
  getStudentGroups,
  getStudentSubmissions,
  getStudentSubmission,
  getStudentSubmissionFile,
  getSubmission,
} from './regExpGet.mjs';
import {
  postPracticeCreate,
  postPracticeGroupsCreate,
  postGroupStudent,
  postStudentSubmissionFile,
  postPracticeSubmissions,
  postPracticeGroupSubmissions,
  postPracticeSubmissionEdit,
} from './regExpPost.mjs';
import {
  postStudentSubmissionGrade,
  postPracticeSubmissionsGrade,
} from './regExpPut.mjs';
import { deleteGroup, deleteStudentGroup } from './regExpDelete.mjs';
import { add7days, parseDateMatlab } from './utils.mjs';
// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': `${process.env.FRONTEND_URL}`, // Your frontend URL
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true', // Crucial for cookies
  'Access-Control-Max-Age': 86400,
};

export const processRequest = async (req, res) => {
  const { method, url } = req;

  // Handle preflight requests
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      ...corsHeaders,
      'Content-Length': 0,
    });
    return res.end();
  }

  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value);
  });
  // Set respose
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  switch (method) {
    case 'GET': {
      const getRoutes = {
        subject_id: getSubject(url),
        subject_id_practices: getSubjectPractices(url),
        subject_id_practices_id_groups: getSubjectPracticesGroups(url),
        group_id: getGroup(url),
        subject_id_students: getSubjectStudents(url),
        group_id_students: getGroupStudents(url),
        practice_id: getPractice(url),
        practice_id_submissions: getPracticeSubmissions(url),
        student_id_groups: getStudentGroups(url),
        student_id_submissions: getStudentSubmissions(url),
        student_id_submission_id: getStudentSubmission(url),
        student_id_submission_id_file: getStudentSubmissionFile(url),
        submission_id: getSubmission(url),
      };
      if (getRoutes.subject_id) {
        try {
          await authenticate(req, res, true);
          const subject = await query('SELECT * FROM subject WHERE id = ?', [
            getRoutes.subject_id,
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
      } else if (getRoutes.subject_id_practices) {
        try {
          await authenticate(req, res, true);
          const practices = await query(
            'SELECT * FROM practice WHERE subject_id = ?',
            [getRoutes.subject_id_practices]
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
      } else if (getRoutes.subject_id_practices_id_groups) {
        try {
          await authenticate(req, res, true);
          const groups = await query(
            'SELECT pg.* FROM practice_groups pg JOIN practice p ON pg.practice_id = p.id WHERE pg.practice_id = ? AND p.subject_id = ?',
            [
              getRoutes.subject_id_practices_id_groups.practice_id,
              getRoutes.subject_id_practices_id_groups.subject_id,
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
      } else if (getRoutes.group_id) {
        try {
          await authenticate(req, res, true);
          const group = await query(
            'SELECT * FROM practice_groups WHERE id = ?',
            [getRoutes.group_id]
          );
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
      } else if (getRoutes.subject_id_students) {
        try {
          await authenticate(req, res);
          const users_ids = await query(
            'SELECT user_id FROM users_subjects WHERE subject_id = ?',
            [getRoutes.subject_id_students]
          );
          if (users_ids.results.length === 0) {
            res.statusCode = 404;
            return res.end(JSON.stringify({ error: 'Students not found' }));
          }
          const users_ids_array = users_ids.results
            .map(user => user.user_id)
            .flat();
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
      } else if (getRoutes.group_id_students) {
        try {
          await authenticate(req, res, true);
          const users_ids = await query(
            'SELECT user_id FROM practice_groups_users WHERE group_id = ?',
            [getRoutes.group_id_students]
          );
          if (users_ids.results.length === 0) {
            res.statusCode = 404;
            return res.end(JSON.stringify({ error: 'Students not found' }));
          }
          const users_ids_array = users_ids.results
            .map(user => user.user_id)
            .flat();
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
      } else if (getRoutes.practice_id) {
        try {
          await authenticate(req, res, true);
          const practice = await query('SELECT * FROM practice WHERE id = ?', [
            getRoutes.practice_id,
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
      } else if (getRoutes.practice_id_submissions) {
        try {
          await authenticate(req, res);
          const submissions = await query(
            'SELECT id, user_id, practice_id, file_url, delivery_date, feedback, grade, evaluator_grade FROM submissions WHERE practice_id = ?',
            [getRoutes.practice_id_submissions]
          );
          if (submissions.results.length === 0) {
            res.statusCode = 404;
            return res.end(
              JSON.stringify({ error: 'User submissions not found' })
            );
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
      } else if (getRoutes.student_id_groups) {
        try {
          await authenticate(req, res, true);
          const groups_ids = await query(
            'SELECT group_id FROM practice_groups_users WHERE user_id = ?',
            [getRoutes.student_id_groups]
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
      } else if (getRoutes.student_id_submissions) {
        try {
          await authenticate(req, res, true);
          const submissions = await query(
            'SELECT * FROM submissions WHERE user_id = ?',
            [getRoutes.student_id_submissions]
          );
          if (submissions.results.length === 0) {
            res.statusCode = 404;
            return res.end(
              JSON.stringify({ error: 'User submissions not found' })
            );
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
      } else if (getRoutes.student_id_submission_id) {
        try {
          await authenticate(req, res, true);
          const submission = await query(
            'SELECT * FROM submissions WHERE user_id = ? AND id = ?',
            [
              getRoutes.student_id_submission_id.student_id,
              getRoutes.student_id_submission_id.submission_id,
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
      } else if (getRoutes.student_id_submission_id_file) {
        try {
          await authenticate(req, res, true);
          const practice_id = await query(
            'SELECT practice_id FROM submissions WHERE id = ? AND user_id = ?',
            [
              getRoutes.student_id_submission_id_file.submission_id,
              getRoutes.student_id_submission_id_file.student_id,
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
            getRoutes.student_id_submission_id_file
          );
          if (!submissionFile) {
            res.statusCode = 404;
            return res.end(
              JSON.stringify({ error: 'Submission file not found' })
            );
          }
          return res.end(JSON.stringify(submissionFile));
        } catch (error) {
          console.error('Database query error on get submission:', error);
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      } else if (getRoutes.submission_id) {
        try {
          await authenticate(req, res, false);
          const submission = await query(
            'SELECT * FROM submissions WHERE id = ?',
            [getRoutes.submission_id]
          );
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
      } else {
        switch (url) {
          case '/subjects':
            try {
              const decoded = await authenticate(req, res, true);
              const subjects_id = await query(
                'SELECT subject_id FROM users_subjects WHERE user_id = ?',
                [decoded.userId]
              );
              const subjects = await query(
                'SELECT * FROM subject WHERE id IN (?)',
                [subjects_id.results.map(subject => subject.subject_id).flat()]
              );
              return res.end(JSON.stringify(subjects.results));
            } catch (error) {
              console.error('Database query error:', error);
              res.statusCode = 500;
              return res.end(
                JSON.stringify({ error: 'Internal server error' })
              );
            }
          case '/users':
            try {
              const users = await query('SELECT * FROM users');
              return res.end(JSON.stringify(users.results));
            } catch (error) {
              console.error('Database query error:', error);
              res.statusCode = 500;
              return res.end(
                JSON.stringify({ error: 'Internal server error' })
              );
            }
          default:
            res.statusCode = 404;
            return res.end(JSON.stringify({ error: 'Not found' }));
        }
      }
    }
    case 'POST': {
      const postRoutes = {
        student_id_submission_id_file: postStudentSubmissionFile(url),
        subject_id_practices: postPracticeCreate(url),
        subject_id_practices_id_groups: postPracticeGroupsCreate(url),
        group_id_student_id: postGroupStudent(url),
        practice_id_submissions: postPracticeSubmissions(url),
        practice_id_group_id_submissions: postPracticeGroupSubmissions(url),
        practice_id_submission_id_edit: postPracticeSubmissionEdit(url),
      };
      if (postRoutes.subject_id_practices) {
        try {
          await authenticate(req, res);
          let body = '';

          // Collect request data
          req.on('data', chunk => {
            body += chunk.toString();
          });

          req.on('end', async () => {
            try {
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
                [
                  postRoutes.subject_id_practices,
                  data.name,
                  data.description,
                  data.deadline,
                ]
              );
              return res.end(JSON.stringify(practice.results));
            } catch (error) {
              console.error('Database query error on create practice:', error);
              res.statusCode = 500;
              return res.end(
                JSON.stringify({ error: 'Internal server error' })
              );
            }
          });
        } catch (error) {
          console.error('Error checking subject ID:', error);
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      } else if (postRoutes.subject_id_practices_id_groups) {
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
                !data.group_name ||
                !data.max_participants ||
                !data.group_date ||
                !data.start_time ||
                !data.end_time
              ) {
                res.statusCode = 400;
                return res.end(
                  JSON.stringify({
                    error:
                      'Group name, max participants, group date, start time and end time are required',
                  })
                );
              }
              const group = await query(
                'INSERT INTO practice_groups (practice_id, name, max_participants, practice_group_date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)',
                [
                  data.practice_id,
                  data.group_name,
                  data.max_participants,
                  data.group_date,
                  data.start_time,
                  data.end_time,
                ]
              );
              res.statusCode = 201;
              return res.end(JSON.stringify(group.results));
            } catch (err) {
              console.error('Database query error on create group:', err);
              if (err.sqlState === unhandledUserDefinedException) {
                res.statusCode = 400;
                return res.end(JSON.stringify({ error: err.sqlMessage }));
              }
              res.statusCode = 500;
              return res.end(
                JSON.stringify({ error: 'Internal server error' })
              );
            }
          });
        } catch {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      } else if (postRoutes.group_id_student_id) {
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
                    error: 'Group ID and student ID are required',
                  })
                );
              }
              const result = await query(
                'INSERT INTO practice_groups_users (group_id, user_id) VALUES (?, ?)',
                [data.group_id, data.student_id]
              );
              res.statusCode = 201;
              return res.end(JSON.stringify(result.results));
            } catch (error) {
              console.error('Database query error on create group:', error);
              res.statusCode = 500;
              return res.end(
                JSON.stringify({ error: 'Internal server error' })
              );
            }
          });
        } catch {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      } else if (postRoutes.student_id_submission_id_file) {
        try {
          await authenticate(req, res, true);
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              if (!data.file_content) {
                res.statusCode = 400;
                return res.end(
                  JSON.stringify({
                    error: 'File content is required',
                  })
                );
              }
              if (data.file_content.length > 1000000) {
                res.statusCode = 400;
                return res.end(
                  JSON.stringify({
                    error: 'File size exceeds the limit of 1MB',
                  })
                );
              }
              if (!data.url_params) {
                res.statusCode = 500;
                return res.end(
                  JSON.stringify({
                    error: 'File URL constructor error',
                  })
                );
              }
              data.url_params.creation_date = parseDateMatlab(
                data.url_params.creation_date
              );
              const file_Name = `U${data.url_params.user_id}_S${data.url_params.subject_id}_P${data.url_params.practice_id}_ID${data.url_params.submission_id}_${data.url_params.creation_date}.m`;
              const url = `${data.url_params.subject_id}/${data.url_params.practice_id}/submissions/${file_Name}`;
              const saveResult = await saveFileSubmission(
                url,
                data.file_content,
                data.url_params.submission_id
              );
              switch (saveResult) {
                case 500: {
                  res.statusCode = 500;
                  return res.end(
                    JSON.stringify({
                      error: 'Internal Server Error on saving submission',
                    })
                  );
                }
                case 400: {
                  res.statusCode = 400;
                  return res.end(
                    JSON.stringify({
                      error: 'Error executing submission file. Syntax Error',
                    })
                  );
                }
                case 201: {
                  res.statusCode = 201;
                  return res.end(
                    JSON.stringify({ message: 'Submission saved successfully' })
                  );
                }
              }
            } catch (error) {
              console.error('Database query error on submit file:', error);
              res.statusCode = 500;
              return res.end(
                JSON.stringify({ error: 'Internal server error' })
              );
            }
          });
        } catch {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      } else if (postRoutes.practice_id_submissions) {
        try {
          await authenticate(req, res);
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              if (!data.practice_id) {
                res.statusCode = 400;
                return res.end(
                  JSON.stringify({
                    error: 'Practice ID is required',
                  })
                );
              }
              const practice_groups = await query(
                'SELECT id, practice_group_date FROM practice_groups WHERE practice_id = ?',
                [data.practice_id]
              );
              if (practice_groups.results.length === 0) {
                res.statusCode = 400;
                return res.end(
                  JSON.stringify({
                    error: 'Practice does not have any groups',
                  })
                );
              }
              const user_ids = await query(
                'SELECT user_id FROM practice_groups_users WHERE group_id IN (?)',
                [practice_groups.results.map(group => group.id).flat()]
              );
              if (user_ids.results.length === 0) {
                res.statusCode = 400;
                return res.end(
                  JSON.stringify({
                    error: 'No students have been assigned to the practice',
                  })
                );
              }
              const submissionsData = user_ids.results.map(user_id => ({
                user_id: user_id.user_id,
                practice_id: data.practice_id,
                delivery_date: add7days(
                  practice_groups.results[0].practice_group_date
                ),
                feedback: '',
                grade: null,
                evaluator_grade: null,
              }));
              const result = [];
              await Promise.all(
                submissionsData.map(async (submission, idx) => {
                  const resultSubmission = await query(
                    'INSERT INTO submissions (user_id, practice_id, delivery_date, feedback, grade, evaluator_grade) VALUES (?, ?, ?, ?, ?, ?)',
                    [
                      submission.user_id,
                      submission.practice_id,
                      submission.delivery_date,
                      submission.feedback,
                      submission.grade,
                      submission.evaluator_grade,
                    ]
                  );
                  if (resultSubmission.results.affectedRows === 0) {
                    res.statusCode = 400;
                    return res.end(
                      JSON.stringify({
                        error: `No submissions were created for user ${submissionsData[idx].user_id}`,
                      })
                    );
                  }
                  result[idx] = resultSubmission.results;
                })
              );
              res.statusCode = 201;
              return res.end(JSON.stringify(result));
            } catch (error) {
              console.error(
                'Database query error on create submissions:',
                error
              );
              res.statusCode = 500;
              return res.end(
                JSON.stringify({ error: 'Internal server error' })
              );
            }
          });
        } catch {
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      } else if (postRoutes.practice_id_group_id_submissions) {
        try {
          await authenticate(req, res);
          let body = '';
          req.on('data', chunk => {
            body += chunk.toString();
          });
          req.on('end', async () => {
            try {
              const data = JSON.parse(body);
              if (!data.practice_id || !data.group_id) {
                res.statusCode = 400;
                return res.end(
                  JSON.stringify({
                    error: 'Practice ID and group ID are required',
                  })
                );
              }
              const group = await query(
                'SELECT id, practice_id, practice_group_date FROM practice_groups WHERE id = ?',
                [data.group_id]
              );
              if (group.results.length === 0) {
                res.statusCode = 400;
                return res.end(
                  JSON.stringify({
                    error: 'Group not found',
                  })
                );
              }
              if (
                Number(group.results[0].practice_id) !==
                Number(data.practice_id)
              ) {
                res.statusCode = 400;
                return res.end(
                  JSON.stringify({
                    error: 'Group does not belong to the practice',
                  })
                );
              }
              const user_ids = await query(
                'SELECT user_id FROM practice_groups_users WHERE group_id = ?',
                [data.group_id]
              );
              if (user_ids.results.length === 0) {
                res.statusCode = 400;
                return res.end(
                  JSON.stringify({
                    error: 'No students have been assigned to the group',
                  })
                );
              }
              const submissionsData = user_ids.results.map(user_id => ({
                user_id: user_id.user_id,
                practice_id: data.practice_id,
                delivery_date: add7days(group.results[0].practice_group_date),
                feedback: '',
                grade: null,
                evaluator_grade: null,
              }));
              const result = [];
              await Promise.all(
                submissionsData.map(async (submission, idx) => {
                  const resultSubmission = await query(
                    'INSERT INTO submissions (user_id, practice_id, delivery_date, feedback, grade, evaluator_grade) VALUES (?, ?, ?, ?, ?, ?)',
                    [
                      submission.user_id,
                      submission.practice_id,
                      submission.delivery_date,
                      submission.feedback,
                      submission.grade,
                      submission.evaluator_grade,
                    ]
                  );
                  if (resultSubmission.results.affectedRows === 0) {
                    res.statusCode = 400;
                    return res.end(
                      JSON.stringify({
                        error: `No submissions were created for user ${submissionsData[idx].user_id}`,
                      })
                    );
                  }
                  result[idx] = resultSubmission.results;
                })
              );
              res.statusCode = 201;
              return res.end(JSON.stringify(result));
            } catch (error) {
              console.error(
                'Database query error on create submissions:',
                error
              );
              res.statusCode = 500;
              return res.end(
                JSON.stringify({ error: 'Internal server error' })
              );
            }
          });
        } catch (error) {
          console.error('Database query error on get submissions:', error);
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      } else if (postRoutes.practice_id_submission_id_edit) {
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
                  JSON.stringify({ error: 'Data required missing' })
                );
              }
              const isSubmission = await query(
                'SELECT id FROM submissions WHERE id = ? AND practice_id = ?',
                [
                  postRoutes.practice_id_submission_id_edit.submission_id,
                  postRoutes.practice_id_submission_id_edit.practice_id,
                ]
              );

              if (isSubmission.results.length === 0) {
                res.statusCode = 400;
                return res.end(
                  JSON.stringify({ error: 'Submission NOT FOUND' })
                );
              }

              const result = await query(
                'UPDATE submissions SET delivery_date = ?, evaluator_grade = ?, grade = ?, feedback = ? WHERE id = ? AND practice_id = ?',
                [
                  data.delivery_date,
                  data.evaluator_grade,
                  data.grade,
                  data.feedback,
                  postRoutes.practice_id_submission_id_edit.submission_id,
                  postRoutes.practice_id_submission_id_edit.practice_id,
                ]
              );
              if (result.results.affectedRows === 0) {
                res.statusCode = 404;
                return res.end(
                  JSON.stringify({ error: 'No submissions affected' })
                );
              }
              res.statusCode = 204;
              return res.end(
                JSON.stringify({ message: 'Submission updated successfully' })
              );
            } catch (error) {
              console.error('Database query error on edit submissions:', error);
              res.statusCode = 500;
              return res.end(
                JSON.stringify({ error: 'Internal server error' })
              );
            }
          });
        } catch (error) {
          console.error('Database query error on edit the submission', error);
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      } else {
        switch (url) {
          case '/login': {
            let body = '';
            let requestComplete = false;

            // Handle request data
            req.on('data', chunk => {
              if (requestComplete) return;
              body += chunk.toString();
            });

            req.on('end', async () => {
              if (requestComplete) return;
              requestComplete = true;

              try {
                // Parse and validate request body
                let data;
                try {
                  data = JSON.parse(body);
                } catch {
                  res.statusCode = 400;
                  return res.end(
                    JSON.stringify({ error: 'Invalid JSON in request body' })
                  );
                }

                // Simple validation
                if (!data.username || !data.password) {
                  res.statusCode = 400;
                  return res.end(
                    JSON.stringify({
                      error: 'Username and password are required',
                    })
                  );
                }

                // Find user by username
                const users = await query(
                  'SELECT * FROM users WHERE username = ?',
                  [data.username]
                );
                const user = users.results[0];

                if (!user) {
                  res.statusCode = 401;
                  return res.end(
                    JSON.stringify({ error: 'Invalid credentials' })
                  );
                }

                // Verify password
                const isPasswordValid = await verifyPassword(
                  data.password,
                  user.password
                );
                if (!isPasswordValid) {
                  res.statusCode = 401;
                  return res.end(
                    JSON.stringify({ error: 'Invalid credentials' })
                  );
                }

                // Generate token
                const token = jwt.sign(
                  {
                    userId: user.id,
                    authMethod: authProviders.jwt,
                    role: user.role,
                  },
                  process.env.JWT_SECRET,
                  {
                    expiresIn: '1h',
                    issuer: `${process.env.BACKEND_URL}`,
                  }
                );

                // Set response headers
                const headers = {
                  'Content-Type': 'application/json',
                  'Set-Cookie': `token=${token}; HttpOnly; Secure; SameSite=None; Max-Age=3600; Path=/`,
                  'Access-Control-Allow-Origin': `${process.env.FRONTEND_URL}`,
                  'Access-Control-Allow-Credentials': 'true',
                };

                // Send successful response
                res.writeHead(200, headers);
                return res.end(
                  JSON.stringify({
                    message: 'Login successful',
                    user: {
                      id: user.id,
                      username: user.username,
                    },
                  })
                );
              } catch (error) {
                console.error('Login error:', error);
                if (!res.headersSent) {
                  res.statusCode = 500;
                  res.end(JSON.stringify({ error: 'Internal server error' }));
                }
              }
            });

            // Handle request errors
            req.on('error', error => {
              if (requestComplete) return;
              requestComplete = true;
              console.error('Request error:', error);
              if (!res.headersSent) {
                res.statusCode = 500;
                res.end(JSON.stringify({ error: 'Error processing request' }));
              }
            });

            return; // Prevent further execution
          }
          case '/logout': {
            // Clean HttpOnly cookie
            res.writeHead(200, {
              ...corsHeaders,
              'Content-Type': 'application/json',
              'Set-Cookie': `token=; HttpOnly; Secure; SameSite=None; Max-Age=0; Path=/`,
            });
            return res.end(JSON.stringify({ message: 'Logout successful' }));
          }
          case '/signup': {
            let body = '';

            // Collect request data
            req.on('data', chunk => {
              body += chunk.toString();
            });

            req.on('end', async () => {
              try {
                // Parse and validate request body
                const data = JSON.parse(body);

                // JSON schema validation could be implemented here if needed

                // Simple validation
                if (!data.username || !data.password || !data.role) {
                  res.statusCode = 400;
                  return res.end(
                    JSON.stringify({
                      error: 'Username, password, and role are required',
                    })
                  );
                }
                // Admin Creation not allow
                if (data.role === 'admin') {
                  res.statusCode = 400;
                  return res.end(
                    JSON.stringify({ error: 'Admin creation not allowed' })
                  );
                }

                // Check if user already exists
                const existingUsers = await query(
                  'SELECT * FROM users WHERE username = ?',
                  [data.username]
                );
                if (existingUsers.results && existingUsers.results.length > 0) {
                  res.statusCode = 409;
                  return res.end(
                    JSON.stringify({ error: 'User already exists' })
                  );
                }

                // Hash password
                const hashedPassword = await hashPassword(data.password);

                // Insert new user
                await query(
                  'INSERT INTO users (username, password, password_salt, role) VALUES (?, ?, ?, ?)',
                  [data.username, hashedPassword, 12, data.role]
                );

                // Registration successful
                res.statusCode = 201;
                return res.end(
                  JSON.stringify({
                    message: 'User registered successfully',
                    user: {
                      username: data.username,
                      role: data.role,
                    },
                  })
                );
              } catch (error) {
                console.error('Registration error:', error);
                res.statusCode = 500;
                return res.end(
                  JSON.stringify({ error: 'Internal server error' })
                );
              }
            });

            break;
          }
          default:
            res.statusCode = 404;
            return res.end('Not found');
        }
        break;
      }
      break;
    }
    case 'PUT': {
      const putRoutes = {
        student_id_submission_id_grade: postStudentSubmissionGrade(url),
        practice_id_submssions_grade: postPracticeSubmissionsGrade(url),
      };
      if (putRoutes.student_id_submission_id_grade) {
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
                !data.submission_id ||
                !data.evaluator_grade ||
                !data.user_id
              ) {
                res.statusCode = 400;
                return res.end(
                  JSON.stringify({
                    error:
                      'Submission ID or evaluator grade or user ID is missing',
                  })
                );
              }
              if (
                Number(data.submission_id) !==
                Number(putRoutes.student_id_submission_id_grade.submission_id)
              ) {
                res.statusCode = 500;
                return res.end(
                  JSON.stringify({ error: 'Internal server error' })
                );
              }
              const result = await query(
                'UPDATE submissions set grade = ? WHERE id = ? AND user_id = ?',
                [data.evaluator_grade, data.submission_id, data.user_id]
              );
              if (result.results.affectedRows === 0) {
                res.statusCode = 404;
                return res.end(
                  JSON.stringify({ error: 'No submissions affected' })
                );
              }
              res.statusCode = 204;
              return res.end(
                JSON.stringify({ message: 'Submission updated successfully' })
              );
            } catch (error) {
              console.error(
                'Database query error on create submissions:',
                error
              );
              res.statusCode = 500;
              return res.end(
                JSON.stringify({ error: 'Internal server error' })
              );
            }
          });
        } catch (error) {
          console.error('Database query error on update grade:', error);
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      } else if (putRoutes.practice_id_submssions_grade) {
        try {
          await authenticate(req, res);
          throw new Error('API ENDPOINT PENDING TO BE DEVELOPED');
        } catch (error) {
          console.error('Database query error on update grade:', error);
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      }
      break;
    }
    case 'DELETE': {
      const deleteRoutes = {
        group_id: deleteGroup(url),
        group_id_student_id: deleteStudentGroup(url),
      };
      if (deleteRoutes.group_id) {
        try {
          await authenticate(req, res);
          const result = await query(
            'DELETE FROM practice_groups WHERE id = ?',
            [deleteRoutes.group_id]
          );
          if (result.results.affectedRows > 0) {
            res.statusCode = 200;
            return res.end(
              JSON.stringify({ message: 'Group deleted successfully' })
            );
          } else {
            res.statusCode = 404;
            return res.end(JSON.stringify({ error: 'Group not found' }));
          }
        } catch (error) {
          console.error('Database query error:', error);
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      } else if (deleteRoutes.group_id_student_id) {
        try {
          await authenticate(req, res);
          const result = await query(
            'DELETE FROM practice_groups_users WHERE group_id = ? AND user_id = ?',
            [
              deleteRoutes.group_id_student_id.group_id,
              deleteRoutes.group_id_student_id.student_id,
            ]
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
            return res.end(
              JSON.stringify({ error: 'Student not found in group' })
            );
          }
        } catch (error) {
          console.error('Database query error:', error);
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Internal server error' }));
        }
      }
      res.statusCode = 404;
      return res.end(JSON.stringify({ error: 'Not found' }));
    }
  }
};
