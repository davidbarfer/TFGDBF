import jwt from 'jsonwebtoken'
import { query, hashPassword, verifyPassword } from './database.mjs'
import { authProviders } from './database.mjs'
import { checkGetSubject, checkGetSubjectPractices, checkGetSubjectPracticesGroups, checkGetGroup } from './regExpGet.mjs'
import { checkPostPracticeCreate, checkPostPracticeGroupsCreate } from './regExpPost.mjs'
import { checkDeleteGroup } from './regExpDelete.mjs'
// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': 'http://localhost:4321', // Your frontend URL
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Credentials': 'true', // Crucial for cookies
  'Access-Control-Max-Age': 86400
}

export const processRequest = async (req, res) => {
  const { method, url } = req
  
  // Handle preflight requests
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      ...corsHeaders,
      'Content-Length': 0
    })
    return res.end()
  }
  
  // Set CORS headers for all responses
  Object.entries(corsHeaders).forEach(([key, value]) => {
    res.setHeader(key, value)
  })
  let subject_url = false
  let practices_url = false
  let groups_url = false
  let group_url = false
  switch (method) {
    case 'GET':
      try {
        subject_url = await checkGetSubject(url)
        practices_url = await checkGetSubjectPractices(url)
        groups_url = await checkGetSubjectPracticesGroups(url)
        group_url = await checkGetGroup(url)
      }
      catch (error) {
        console.error('Error checking subject ID:', error)
        subject_url = false
      }
      if (subject_url) {
        try {
          const subject = await query('SELECT * FROM subject WHERE id = ?', [subject_url])
          if (subject.results.length === 0) {
            res.statusCode = 404
            return res.end(JSON.stringify({ error: 'Subject not found' }))
          }
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          return res.end(JSON.stringify(subject.results[0]))
        } catch (error) {
          console.error('Database query error:', error)
          res.statusCode = 500
          return res.end(JSON.stringify({ error: 'Internal server error' }))
        }
      } else if (practices_url) {
        try {
          if(!req.headers.authorization) {
            res.statusCode = 401
            return res.end(JSON.stringify({ error: 'Unauthorized', message: 'No authorization header' }))
          }
          const token = req.headers.authorization
          const decoded = jwt.verify(token, process.env.JWT_SECRET)
          if (decoded.role !== 'professor' && decoded.role !== 'admin') {
            res.statusCode = 401
            return res.end(JSON.stringify({ error: 'Unauthorized'}))
          }
          const practices = await query('SELECT * FROM practice WHERE subject_id = ?', [practices_url])
          if (practices.results.length === 0) {
            res.statusCode = 404
            return res.end(JSON.stringify({ error: 'Practices not found' }))
          }
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          return res.end(JSON.stringify(practices.results))
        } catch (error) {
          console.error('Database query error:', error)
          res.statusCode = 500
          return res.end(JSON.stringify({ error: 'Internal server error' }))
        }
      } else if (groups_url) {
        try {
          if(!req.headers.authorization) {
            res.statusCode = 401
            return res.end(JSON.stringify({ error: 'Unauthorized', message: 'No authorization header' }))
          }
          const token = req.headers.authorization
          const decoded = jwt.verify(token, process.env.JWT_SECRET)
          if (decoded.role !== 'professor' && decoded.role !== 'admin') {
            res.statusCode = 401
            return res.end(JSON.stringify({ error: 'Unauthorized'}))
          }
          const groups = await query(
            'SELECT pg.* FROM practice_groups pg JOIN practice p ON pg.practice_id = p.id WHERE pg.practice_id = ? AND p.subject_id = ?',
            [groups_url.practice_id, groups_url.subject_id]
          )
          if (groups.results.length === 0) {
            res.statusCode = 404
            return res.end(JSON.stringify({ error: 'Groups not found' }))
          }
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          return res.end(JSON.stringify(groups.results))
        } catch (error) {
          console.error('Database query error:', error)
          res.statusCode = 500
          return res.end(JSON.stringify({ error: 'Internal server error' }))
        }
      } else if (group_url) {
        try {
          if(!req.headers.authorization) {
            res.statusCode = 401
            return res.end(JSON.stringify({ error: 'Unauthorized', message: 'No authorization header' }))
          }
          const token = req.headers.authorization
          const decoded = jwt.verify(token, process.env.JWT_SECRET)
          if (decoded.role !== 'professor' && decoded.role !== 'admin') {
            res.statusCode = 401
            return res.end(JSON.stringify({ error: 'Unauthorized'}))
          }
          const group = await query('SELECT * FROM practice_groups WHERE id = ?', [group_url])
          if (group.results.length === 0) {
            res.statusCode = 404
            return res.end(JSON.stringify({ error: 'Group not found' }))
          }
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          return res.end(JSON.stringify(group.results[0]))
        } catch (error) {
          console.error('Database query error:', error)
          res.statusCode = 500
          return res.end(JSON.stringify({ error: 'Internal server error' }))
        }
      } else {
        switch (url) {
        case '/professor/subjects':
          try {
            if (!req.headers.authorization) {
              res.statusCode = 401
              return res.end(JSON.stringify({ error: 'Unauthorized', message: 'No authorization header' }))
            }
            const token = req.headers.authorization
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            if (decoded.role !== 'professor' && decoded.role !== 'admin') {
              res.statusCode = 401
              return res.end(JSON.stringify({ error: 'Unauthorized'}))
            }
            const subjects_id = await query('SELECT subject_id FROM users_subjects WHERE user_id = ?', [decoded.userId])
            const subjects = await query('SELECT * FROM subject WHERE id IN (?)', [subjects_id.results.map(subject => subject.subject_id).flat()])
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            return res.end(JSON.stringify(subjects.results))
          } catch (error) {
            console.error('Database query error:', error)
            res.statusCode = 500
            return res.end(JSON.stringify({ error: 'Internal server error' }))
          }
        case '/users':
          try {
            const users = await query('SELECT * FROM users')
            res.setHeader('Content-Type', 'application/json; charset=utf-8')
            return res.end(JSON.stringify(users.results))
          } catch (error) {
            console.error('Database query error:', error)
            res.statusCode = 500
            return res.end(JSON.stringify({ error: 'Internal server error' }))
          }
          default:
          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          return res.end(JSON.stringify({ error: 'Not found' }))
        }
      }
    case 'POST':
      try {
        subject_url = await checkPostPracticeCreate(url);
        groups_url = await checkPostPracticeGroupsCreate(url)
      }
      catch (error) {
        console.error('Error checking subject ID:', error)
        subject_url = false
      }
      if (subject_url) {
        try {
          if(req.headers.authorization){
            const token = req.headers.authorization
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            if (decoded.role !== 'professor' && decoded.role !== 'admin') {
              res.statusCode = 401
              return res.end(JSON.stringify({ error: 'Unauthorized'}))
            }
          }
          let body = ''
          
          // Collect request data
          req.on('data', chunk => {
            body += chunk.toString()
          })

          req.on('end', async () => {
            try {
              // Parse and validate request body
              const data = JSON.parse(body)
              
              // JSON schema validation
              const practiceSchema = {
                type: 'object',
                required: ['name', 'description'],
                properties: {
                  name: { type: 'string' },
                  description: { type: 'string' }
                },
                additionalProperties: false
              }
              
              // Simple validation
              if (!data.name || !data.description) {
                res.statusCode = 400
                return res.end(JSON.stringify({ error: 'Name and description are required' }))
              }

              const practice = await query('INSERT INTO practice (subject_id, name, description, deadline) VALUES (?, ?, ?, ?)', [subject_url, data.name, data.description, data.deadline])
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              return res.end(JSON.stringify(practice.results))
            } catch (error) {
              console.error('Database query error:', error)
              res.statusCode = 500
              return res.end(JSON.stringify({ error: 'Internal server error' }))
            }
          })
        } catch (error) {
          console.error('Error checking subject ID:', error)
          res.statusCode = 500
          return res.end(JSON.stringify({ error: 'Internal server error' }))
        }
      } else if(groups_url) {
        try {
          if(req.headers.authorization){
            const token = req.headers.authorization
            const decoded = jwt.verify(token, process.env.JWT_SECRET)
            if (decoded.role !== 'professor' && decoded.role !== 'admin') {
              res.statusCode = 401
              return res.end(JSON.stringify({ error: 'Unauthorized'}))
            }
          }
          let body = ''
          req.on('data', chunk => {
            body += chunk.toString()
          })
          req.on('end', async () => {
            try {
              const data = JSON.parse(body)
              if (!data.group_name || !data.max_participants || !data.group_date || !data.start_time || !data.end_time) {
                res.statusCode = 400
                return res.end(JSON.stringify({ error: 'Group name, max participants, group date, start time and end time are required' }))
              }
              const group = await query('INSERT INTO practice_groups (practice_id, name, max_participants, practice_group_date, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?)', [data.practice_id, data.group_name, data.max_participants, data.group_date, data.start_time, data.end_time])
              res.statusCode = 201
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              return res.end(JSON.stringify(group.results))
            } catch (error) {
              console.error('Database query error:', error)
              res.statusCode = 500
              return res.end(JSON.stringify({ error: 'Internal server error' }))
            }
          })
        } catch {
          res.statusCode = 500
          return res.end(JSON.stringify({ error: 'Internal server error' }))
        }
      } else {
      switch (url) {
        case '/login': {
          let body = ''
          
          // Collect request data
          req.on('data', chunk => {
            body += chunk.toString()
          })

          req.on('end', async () => {
            try {
              // Parse and validate request body
              const data = JSON.parse(body)
              
              // JSON schema validation
              const loginSchema = {
                type: 'object',
                required: ['username', 'password'],
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string', minLength: 8 }
                },
                additionalProperties: false
              }
              
              // Simple validation
              if (!data.username || !data.password) {
                res.statusCode = 400
                return res.end(JSON.stringify({ error: 'Username and password are required' }))
              }

              // Find user by username
              const users = await query('SELECT * FROM users WHERE username = ?', [data.username])
              const user = users.results[0]
              
              if (!user) {
                res.statusCode = 401
                return res.end(JSON.stringify({ error: 'Invalid credentials' }))
              }
              
              // Verify password
              const isPasswordValid = await verifyPassword(data.password, user.password)
              
              if (!isPasswordValid) {
                res.statusCode = 401
                return res.end(JSON.stringify({ error: 'Invalid credentials' }))
              }

              // Generate token
              const token = jwt.sign(
                {
                  userId: user.id,
                  authMehod: authProviders.jwt,
                  role: user.role,
                },
                process.env.JWT_SECRET,
                {
                  expiresIn: '1h',
                  issuer: 'http://localhost:1234'
                }
              );
              
              // Set as HttpOnly Secure cookie
              res.writeHead(200, {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'Set-Cookie' : `token=${token}; HttpOnly; Secure; SameSite=None; Max-Age=3600; Path=/`
              });
              // Login successful
              return res.end(JSON.stringify({ 
                message: 'Login successful',
                user: {
                  id: user.id,
                  username: user.username,
                }
              }))
              
            } catch (error) {
              console.error('Login error:', error)
              res.statusCode = 500
              return res.end(JSON.stringify({ error: 'Internal server error' }))
            }
          })
          
          break
        }
        case '/logout': {
          // Clean HttpOnly cookie
          res.writeHead(200, {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Set-Cookie' : `token=; HttpOnly; Secure; SameSite=None; Max-Age=0; Path=/`
          });
          return res.end(JSON.stringify({ message: 'Logout successful' }))
        }
        case '/signup': {
          let body = ''
          
          // Collect request data
          req.on('data', chunk => {
            body += chunk.toString()
          })

          req.on('end', async () => {
            try {
              // Parse and validate request body
              const data = JSON.parse(body)

              // JSON schema validation
              const signupSchema = {
                type: 'object',
                required: ['username', 'password','role'],
                properties: {
                  username: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  role: { type: 'string' }
                },
                additionalProperties: false
              }
              
              // Simple validation
              if (!data.username || !data.password || !data.role) {
                res.statusCode = 400
                return res.end(JSON.stringify({ error: 'Username, password, and role are required' }))
              }
              // Admin Creation not allow
              if (data.role === 'admin') {
                res.statusCode = 400
                return res.end(JSON.stringify({ error: 'Admin creation not allowed' }))
              }
              
              // Check if user already exists
              const existingUsers = await query('SELECT * FROM users WHERE username = ?', [data.username])
              if (existingUsers.results && existingUsers.results.length > 0) {
                res.statusCode = 409
                return res.end(JSON.stringify({ error: 'User already exists' }))
              }
              
              // Hash password
              const hashedPassword = await hashPassword(data.password)
              
              // Insert new user
              await query('INSERT INTO users (username, password, password_salt, role) VALUES (?, ?, ?, ?)', [data.username, hashedPassword, 12, data.role])
              
              // Registration successful
              res.statusCode = 201
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              return res.end(JSON.stringify({ 
                message: 'User registered successfully',
                user: {
                  username: data.username,
                  role: data.role
                }
              }))
              
            } catch (error) {
              console.error('Registration error:', error)
              res.statusCode = 500
              return res.end(JSON.stringify({ error: 'Internal server error' }))
            }
          })
          
          break
        }
        default:
          res.statusCode = 404
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          return res.end('Not found')
      }
    }
    case 'DELETE':
    try {
      group_url = await checkDeleteGroup(url)
    }
    catch (error) {
      console.error('Error checking group ID:', error)
    }
    if (group_url) {
      try {
        if(!req.headers.authorization) {
          res.statusCode = 401
          return res.end(JSON.stringify({ error: 'Unauthorized', message: 'No authorization header' }))
        }
        const token = req.headers.authorization
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        if (decoded.role !== 'professor' && decoded.role !== 'admin') {
          res.statusCode = 401
          return res.end(JSON.stringify({ error: 'Unauthorized'}))
        }
        const result = await query('DELETE FROM practice_groups WHERE id = ?', [group_url])
        if (result.results.affectedRows > 0) {
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json; charset=utf-8')
          return res.end(JSON.stringify({ message: 'Group deleted successfully' }))
        }
        else {
          res.statusCode = 404
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          return res.end(JSON.stringify({ error: 'Group not found' }))
        }
      }
      catch (error) {
        console.error('Database query error:', error)
        res.statusCode = 500
        return res.end(JSON.stringify({ error: 'Internal server error' }))
      }
    } else {
      switch(url) {
        default:
          res.statusCode = 404
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          return res.end(JSON.stringify({ error: 'Not found' }))
      }
    }
  }
}