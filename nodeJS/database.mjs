import mysql from 'mysql2/promise'
import bcrypt from 'bcrypt'
// Create the connection to database
export const connection = await mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
})

export async function query(sql, params) {
  const [results, fields] = await connection.query(sql, params)
  return {
    results,
    fields
  }
}

export async function hashPassword(password) {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash)
}