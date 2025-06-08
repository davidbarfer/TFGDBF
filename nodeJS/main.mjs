import http from 'node:http'
import mysql from 'mysql2/promise'
import { processRequest } from './api.js'

// Create the connection to database
const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

try {
  const [results, fields] = await connection.query(
    'SELECT * FROM `users`'
  );

  console.log('RESULTS', results); // results contains rows returned by server
  console.log('FIELDS', fields); // fields contains extra meta data about results, if available
} catch (err) {
  console.log(err);
}

const server = http.createServer(processRequest)

server.listen(1234, () => {
  console.log('server listening on port http://localhost:1234')
})