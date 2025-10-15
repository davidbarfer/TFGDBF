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

INSERT INTO practice (subject_id, name, description, deadline) VALUES
(1, 'Control PI', 'Diseñe un control PI', '2025-09-18'),
(2, 'Control GPC', 'Diseñe un control GPC', '2025-08-18');

INSERT INTO practice_groups (practice_id, name, max_participants, practice_group_date, start_time, end_time) VALUES
(1, 1, 10, '2025-09-17', '08:00:00', '10:00:00'),
(1, 2, 15, '2025-09-17', '10:00:00', '12:00:00'),
(1, 3, 20, '2025-09-17', '12:00:00', '14:00:00'),
(2, 1, 20, '2025-08-17', '08:00:00', '10:00:00');

INSERT INTO users_subjects (user_id, subject_id) VALUES
(2, 1),
(2, 2),
(3, 1),
(3, 2),
(4, 2),
(4, 1);

INSERT INTO practice_groups_users (group_id, user_id) VALUES
(1, 2),
(2, 4);

INSERT INTO submissions (user_id, practice_id, delivery_date, grade) VALUES
(2, 1, '2023-01-01', 10),
(4, 2, '2026-01-02', NULL),
(2, 2, '2023-01-03', NULL);

UPDATE submissions SET feedback = 'Buen trabajo' WHERE id = 1;


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
