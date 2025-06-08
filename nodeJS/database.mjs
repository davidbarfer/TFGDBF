import mysql from 'mysql2/promise'

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