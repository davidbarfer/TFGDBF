-- MySQL Script
-- Database: doctus_lite
-- Created: 2025-06-04

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS doctus_lite
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE doctus_lite;

-- Drop tables if they exist (for fresh start)
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS saml_sessions;
DROP TABLE IF EXISTS users;

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    password_salt NUMERIC NOT NULL,
    auth_provider ENUM('jwt', 'google', 'saml') DEFAULT 'jwt',
    provider_id VARCHAR(255),
    role ENUM('professor', 'student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE saml_sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    user_id INT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla: asignaturas
CREATE TABLE IF NOT EXISTS subject (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  course VARCHAR(50),
  degree VARCHAR(50)
);

-- Tabla: Practicas
CREATE TABLE IF NOT EXISTS practice (
  id INT AUTO_INCREMENT PRIMARY KEY,
  subject_id INT NOT NULL,
  deadline DATE,
  file_url VARCHAR(255),
  FOREIGN KEY (subject_id) REFERENCES subject(id)
);

-- Tabla: Grupos
CREATE TABLE IF NOT EXISTS groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  practice_id INT NOT NULL,
  FOREIGN KEY (practice_id) REFERENCES practice(id)
);


-- Insert sample data
INSERT INTO users (username, password, password_salt, role) VALUES
('admin', '$2b$12$W16liLOZR6U4Zp3iptOPEOPNCl8ob/ieZqmEkdOWrrD5yo3qYK5xW',12,'admin'),
('user1', '$2b$12$W16liLOZR6U4Zp3iptOPEOPNCl8ob/ieZqmEkdOWrrD5yo3qYK5xW',12,'student')
ON DUPLICATE KEY UPDATE username = username;

-- Show tables
SHOW TABLES;

-- Display sample data
SELECT * FROM users;

