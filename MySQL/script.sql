-- MySQL Script
-- Database: doctus_lite
-- Created: 2025-06-04

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS doctus_lite
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Use the database
USE doctus_lite;

-- Example table: users
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Example table: posts
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
INSERT INTO users (username, email, password_hash) VALUES
('admin', 'admin@doctuslite.com', 'hashed_password_here'),
('user1', 'user1@example.com', 'hashed_password_here')
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

