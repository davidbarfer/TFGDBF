import jwt from 'jsonwebtoken';
import { query, hashPassword, verifyPassword } from './database.mjs';
import { authProviders, authenticate } from './database.mjs';
import {
  getSubject,
  getSubjectPractices,
  getSubjectPracticesGroups,
  getGroup,
  getGroupStudents,
  getSubjectStudents,
  getPractice,
} from './regExpGet.mjs';
import { postPracticeCreate, postPracticeGroupsCreate } from './regExpPost.mjs';
import { deleteGroup, deleteStudentGroup } from './regExpDelete.mjs';
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
  let subject_id = false;
  let subject_id_practices = false;
  let subject_id_practices_id_groups = false;
  let group_id = false;
  let subject_id_students = false;
  let group_id_students = false;
  let student_group_url = false;
  let practice_url = false;
  switch (method) {
    case 'GET':
      subject_id = getSubject(url);
      subject_id_practices = getSubjectPractices(url);
      subject_id_practices_id_groups = getSubjectPracticesGroups(url);
      group_id = getGroup(url);
      subject_id_students = getSubjectStudents(url);
      group_id_students = getGroupStudents(url);
      practice_url = getPractice(url);
      if (subject_id) {
        try {
          await authenticate(req, res, true);
          const subject = await query('SELECT * FROM subject WHERE id = ?', [
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
      } else if (subject_id_practices) {
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
      } else if (subject_id_practices_id_groups) {
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
      } else if (group_id) {
        try {
          await authenticate(req, res);
          const group = await query(
            'SELECT * FROM practice_groups WHERE id = ?',
            [group_id]
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
      } else if (subject_id_students) {
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
      } else if (group_id_students) {
        try {
          await authenticate(req, res);
          const users_ids = await query(
            'SELECT user_id FROM practice_groups_users WHERE group_id = ?',
            [group_id_students]
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
      } else if (practice_url) {
        try {
          await authenticate(req, res, true);
          const practice = await query('SELECT * FROM practice WHERE id = ?', [
            practice_url,
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
    case 'POST':
      subject_id_practices = postPracticeCreate(url);
      subject_id_practices_id_groups = postPracticeGroupsCreate(url);
      if (subject_id_practices) {
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
                  subject_id_practices,
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
      } else if (subject_id_practices_id_groups) {
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
    case 'DELETE':
      group_id = deleteGroup(url);
      student_group_url = deleteStudentGroup(url);
      if (group_id) {
        try {
          await authenticate(req, res);
          const result = await query(
            'DELETE FROM practice_groups WHERE id = ?',
            [group_id]
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
      } else if (student_group_url) {
        try {
          await authenticate(req, res);
          const result = await query(
            'DELETE FROM practice_groups_users WHERE group_id = ? AND user_id = ?',
            [student_group_url.group_id, student_group_url.student_id]
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
};
