-- MySQL Script
-- Database: doctus_lite
-- Created: 2025-06-04

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS doctus_lite
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE doctus_lite;
-- Drop Triggers if exist
DROP TRIGGER IF EXISTS create_group;
DROP TRIGGER IF EXISTS delete_group;
-- Drop tables if they exist (for fresh start)
DROP TABLE IF EXISTS users_subjects;
DROP TABLE IF EXISTS practice_groups_users;
DROP TABLE IF EXISTS practice_groups;
DROP TABLE IF EXISTS submissions;
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
    name VARCHAR(50) NOT NULL,
    surname VARCHAR(50) NOT NULL,
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
  name VARCHAR(100) NOT NULL,
  description TEXT,
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
  current_participants NUMERIC NOT NULL DEFAULT 0,
  practice_group_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
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

-- Change delimiter to allow for multiple statements in triggers
DELIMITER //

-- Create security triggers
CREATE TRIGGER create_group
BEFORE INSERT ON practice_groups
FOR EACH ROW
BEGIN
  DECLARE max_group_name NUMERIC;
  
  -- Check if a group with the same name already exists for this practice
  IF EXISTS (SELECT 1 FROM practice_groups WHERE practice_id = NEW.practice_id AND name = NEW.name) THEN
    -- Find the maximum group name for this practice and increment it by 1
    SELECT COALESCE(MAX(name), 0) + 1 INTO max_group_name
    FROM practice_groups
    WHERE practice_id = NEW.practice_id;
    
    -- Set the new group name to the incremented value
    SET NEW.name = max_group_name;
  END IF;
END//

CREATE TRIGGER delete_group
BEFORE DELETE ON practice_groups
FOR EACH ROW
BEGIN
  DELETE FROM practice_groups_users WHERE group_id = OLD.id;
END//

-- Reset delimiter back to default
DELIMITER ;

-- Insert sample data
INSERT INTO users (username, password, password_salt, role, name, surname) VALUES
('admin', '$2b$12$W16liLOZR6U4Zp3iptOPEOPNCl8ob/ieZqmEkdOWrrD5yo3qYK5xW',12,'admin', 'David', 'Barrero'),
('student', '$2b$12$W16liLOZR6U4Zp3iptOPEOPNCl8ob/ieZqmEkdOWrrD5yo3qYK5xW',12,'student', 'Manolo', 'Garcia'),
('professor', '$2b$12$W16liLOZR6U4Zp3iptOPEOPNCl8ob/ieZqmEkdOWrrD5yo3qYK5xW',12,'professor', 'Mortadelo', 'Filemon'),
('student2', '$2b$12$W16liLOZR6U4Zp3iptOPEOPNCl8ob/ieZqmEkdOWrrD5yo3qYK5xW',12,'student', 'Manolo', 'Garcia')
ON DUPLICATE KEY UPDATE username = username;

INSERT INTO subject (name, course, degree) VALUES
('Fundametos de Control Automático', 2, 'Grado en Ingeniería de Tecnologías Industriales'),
('Complentos de Control', 4, 'Grado en Ingeniería de Tecnologías Industriales')
ON DUPLICATE KEY UPDATE name = name, course = course, degree = degree; 

INSERT INTO practice (subject_id, name, description, deadline, file_url) VALUES
(1, 'Control PI', 'Diseñe un control PI', '2025-09-18', 'https://example.com/practice1.pdf'),
(2, 'Control GPC', 'Diseñe un control GPC', '2025-08-18', 'https://example.com/practice2.pdf');

INSERT INTO practice_groups (practice_id, name, max_participants, practice_group_date, start_time, end_time) VALUES
(1, 1, 10, '2025-09-18', '08:00:00', '10:00:00'),
(1, 2, 10, '2025-09-18', '10:00:00', '12:00:00'),
(2, 1, 10, '2025-08-18', '08:00:00', '10:00:00');

INSERT INTO users_subjects (user_id, subject_id) VALUES
(2, 1),
(2, 2),
(3, 1),
(3, 2),
(4, 1),
(4, 2);

INSERT INTO practice_groups_users (group_id, user_id) VALUES
(1, 2),
(2, 2),
(1, 4),
(2, 4);

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


