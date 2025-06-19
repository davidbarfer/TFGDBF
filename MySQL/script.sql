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
DROP TABLE IF EXISTS users_subjects;
DROP TABLE IF EXISTS practice_groups_users;
DROP TABLE IF EXISTS practice_groups;
DROP TABLE IF EXISTS practice;
DROP TABLE IF EXISTS subject;
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
  course NUMERIC NOT NULL,
  degree ENUM('Grado en Ingeniería de Tecnologías Industriales', 'Grado en Ingeniería de las Tecnologías de Telecomunicación') NOT NULL
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
CREATE TABLE IF NOT EXISTS practice_groups (
  id INT AUTO_INCREMENT PRIMARY KEY,
  practice_id INT NOT NULL,
  name NUMERIC NOT NULL,
  max_participants NUMERIC NOT NULL,
  FOREIGN KEY (practice_id) REFERENCES practice(id)
);

-- Tabla Entregas:
CREATE TABLE IF NOT EXISTS submissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    practice_id INT NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    delivery_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    grade DECIMAL(5,2),
    feedback TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (practice_id) REFERENCES practice(id)
);


-- Tabla Relaciones: Usuarios-Asignaturas
CREATE TABLE IF NOT EXISTS users_subjects (
  user_id INT NOT NULL,
  subject_id INT NOT NULL,
  PRIMARY KEY (user_id, subject_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (subject_id) REFERENCES subject(id)
);

-- Tabla Relaciones: Grupos-Usuarios
CREATE TABLE IF NOT EXISTS practice_groups_users (
  group_id INT NOT NULL,
  user_id INT NOT NULL,
  PRIMARY KEY (group_id, user_id),
  FOREIGN KEY (group_id) REFERENCES practice_groups(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Insert sample data
INSERT INTO users (username, password, password_salt, role) VALUES
('admin', '$2b$12$W16liLOZR6U4Zp3iptOPEOPNCl8ob/ieZqmEkdOWrrD5yo3qYK5xW',12,'admin'),
('user1', '$2b$12$W16liLOZR6U4Zp3iptOPEOPNCl8ob/ieZqmEkdOWrrD5yo3qYK5xW',12,'student')
ON DUPLICATE KEY UPDATE username = username;

INSERT INTO subject (name, course, degree) VALUES
('Fundametos de Control Automático', 2, 'Grado en Ingeniería de Tecnologías Industriales'),
('Complentos de Control', 4, 'Grado en Ingeniería de Tecnologías Industriales');

INSERT INTO practice (subject_id, deadline, file_url) VALUES
(1, '2025-09-18', 'https://example.com/practice1.pdf'),
(2, '2025-08-18', 'https://example.com/practice2.pdf');

INSERT INTO practice_groups (practice_id, name, max_participants) VALUES
(1, 1, 10),
(2, 2, 10);

-- Show tables
SHOW TABLES;

-- Display sample data
SELECT * FROM users;
SELECT * FROM subject;
SELECT * FROM practice;
SELECT * FROM practice_groups;
SELECT * FROM submissions;
SELECT * FROM users_subjects;
SELECT * FROM practice_groups_users;


