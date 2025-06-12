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
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS posts;

-- Table: users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    password_salt NUMERIC NOT NULL,
    role ENUM('professor', 'student', 'admin') DEFAULT 'student',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: posts
CREATE TABLE IF NOT EXISTS posts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    user_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insert sample data
INSERT INTO users (username, password, password_salt, role) VALUES
('admin', '$2b$12$W16liLOZR6U4Zp3iptOPEOPNCl8ob/ieZqmEkdOWrrD5yo3qYK5xW',12,'admin'),
('user1', '$2b$12$W16liLOZR6U4Zp3iptOPEOPNCl8ob/ieZqmEkdOWrrD5yo3qYK5xW',12,'student')
ON DUPLICATE KEY UPDATE username = username;

INSERT INTO posts (title, content, user_id) VALUES
('Welcome to DoctusLite', 'This is the first post in our system.', 1),
('Getting Started', 'Here are some tips to get started with the platform.', 1)
ON DUPLICATE KEY UPDATE title = title;

-- Show tables
SHOW TABLES;

-- Display sample data
SELECT * FROM users;
SELECT * FROM posts;

