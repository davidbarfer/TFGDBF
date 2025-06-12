import { query, hashPassword, verifyPassword } from './database.mjs'
// CORS headers configuration
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // In production, replace '*' with your frontend domain
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': 86400 // 24 hours
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

  switch (method) {
    case 'GET':
      switch (url) {
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
          return res.end('Not found')
      }

    case 'POST':
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
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 }
                },
                additionalProperties: false
              }
              
              // Simple validation
              if (!data.email || !data.password) {
                res.statusCode = 400
                return res.end(JSON.stringify({ error: 'Email and password are required' }))
              }
              
              // Find user by email
              const [users] = await query('SELECT * FROM users WHERE email = ?', [data.email])
              
              if (!users || users.length === 0) {
                res.statusCode = 401
                return res.end(JSON.stringify({ error: 'Invalid credentials' }))
              }
              
              const user = users[0]
              
              // Verify password
              const isPasswordValid = await verifyPassword(data.password, user.password)
              
              if (!isPasswordValid) {
                res.statusCode = 401
                return res.end(JSON.stringify({ error: 'Invalid credentials' }))
              }
              
              // Login successful
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              return res.end(JSON.stringify({ 
                message: 'Login successful',
                user: {
                  id: user.id,
                  email: user.email,
                  name: user.name
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
        case '/register': {
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
              const registerSchema = {
                type: 'object',
                required: ['email', 'password', 'name'],
                properties: {
                  email: { type: 'string', format: 'email' },
                  password: { type: 'string', minLength: 8 },
                  name: { type: 'string' }
                },
                additionalProperties: false
              }
              
              // Simple validation
              if (!data.email || !data.password || !data.name) {
                res.statusCode = 400
                return res.end(JSON.stringify({ error: 'Email, password, and name are required' }))
              }
              
              // Check if user already exists
              const [existingUsers] = await query('SELECT * FROM users WHERE email = ?', [data.email])
              
              if (existingUsers && existingUsers.length > 0) {
                res.statusCode = 409
                return res.end(JSON.stringify({ error: 'User already exists' }))
              }
              
              // Hash password
              const hashedPassword = await hashPassword(data.password)
              
              // Insert new user
              await query('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [data.email, hashedPassword, data.name])
              
              // Registration successful
              res.statusCode = 201
              res.setHeader('Content-Type', 'application/json; charset=utf-8')
              return res.end(JSON.stringify({ 
                message: 'User registered successfully',
                user: {
                  email: data.email,
                  name: data.name
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
}