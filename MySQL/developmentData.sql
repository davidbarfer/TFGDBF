-- 1. Desactivar restricciones temporalmente para poder insertar/limpiar en cualquier orden
SET FOREIGN_KEY_CHECKS = 0;

-- Insert sample data
INSERT INTO users (username, password, password_salt, role, name, surname, is_active) VALUES
('admin', '$2b$12$W16liLOZR6U4Zp3iptOPEOPNCl8ob/ieZqmEkdOWrrD5yo3qYK5xW',12,'admin', 'David', 'Barrero', TRUE),
('student', '$2b$12$W16liLOZR6U4Zp3iptOPEOPNCl8ob/ieZqmEkdOWrrD5yo3qYK5xW',12,'student', 'Manolo', 'Garcia', TRUE),
('professor', '$2b$12$W16liLOZR6U4Zp3iptOPEOPNCl8ob/ieZqmEkdOWrrD5yo3qYK5xW',12,'professor', 'Mortadelo', 'Filemon', TRUE),
('student2', '$2b$12$W16liLOZR6U4Zp3iptOPEOPNCl8ob/ieZqmEkdOWrrD5yo3qYK5xW',12,'student', 'Pedro', 'Picapiedra', TRUE),
('professor2', '$2b$12$W16liLOZR6U4Zp3iptOPEOPNCl8ob/ieZqmEkdOWrrD5yo3qYK5xW',12,'professor', 'Manolito', 'Gafotas', FALSE),
('professor3' ,'$2b$12$W16liLOZR6U4Zp3iptOPEOPNCl8ob/ieZqmEkdOWrrD5yo3qYK5xW',12, 'professor', 'Pepito', 'Palotes', TRUE)
ON DUPLICATE KEY UPDATE username = username;

INSERT INTO degrees (id,name) VALUES
(1, 'Grado en Ingeniería de Tecnologías Industriales (Plan 2024)'),
(2, 'Grado en Ingeniería de las Tecnologías de Telecomunicación'),
(3, 'Grado en Ingeniería Aeroespacial'),
(4, 'Grado en Ingeniería Civil'),
(5, 'Grado en Ingeniería Química'),
(6, 'Grado en Ingeniería de Organización Industrial'),
(7, 'Grado en Ingeniería de la Energía'),
(8, 'Grado en Ingeniería Electrónica, Robótica y Mecatrónica'),
(9, '(No se oferta) Grado en Ingeniería de Tecnologías Industriales (Plan 2010)'),
(10, 'Máster Universitario en Ingeniería Industrial (Plan 2024)'),
(11, 'Máster Universitario en Ingeniería de Telecomunicación'),
(12, 'Máster Universitario en Ingeniería Aeronáutica'),
(13, 'Máster Universitario en Ingeniería de Caminos, Canales y Puertos'),
(14, 'Máster Universitario en Ingeniería Química'),
(15, 'Máster Universitario en Diseño Avanzado en Ingeniería Mecánica'),
(16, 'Máster Universitario en Ingeniería en Edificios, Robótica y Automática'),
(17, 'Máster Universitario en Organización Industrial y Gestión de Empresas'),
(18, 'Máster Universitario en Sistemas de Energía Eléctrica'),
(19, 'Máster Universitario en Sistemas de Energía Térmica'),
(20, 'Máster Universitario en Ingeniería Ambiental'),
(21, "Master's Degree in Operation of Space Systems"),
(22, 'Doble Máster Universitario en Ingeniería Química e Ingeniería Ambiental'),
(23, "Joint Master's Degree in Aeronautic Engineering and Operation of Space Systems")
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO subject (name, course, degree_id) VALUES
('Fundametos de Control Automático', 2, 1),
('Complentos de Control', 4, 1)
ON DUPLICATE KEY UPDATE name = name, course = course, degree_id = degree_id; 

INSERT INTO practice (subject_id, name, description, deadline) VALUES
(1, 'Control PI', 'Diseñe un control PI', '2025-12-31'),
(2, 'Control GPC', 'Diseñe un control GPC', '2028-12-31'),
(1, 'Control Test', 'Diseñe un control Test', '2028-12-31');

INSERT INTO practice_groups (practice_id, name, max_participants, practice_group_date, start_time, end_time) VALUES
(1, 1, 10, '2025-09-17', '08:00:00', '10:00:00'),
(1, 2, 15, '2025-09-17', '10:00:00', '12:00:00'),
(1, 3, 20, '2025-09-17', '12:00:00', '14:00:00'),
(2, 1, 20, '2025-08-17', '08:00:00', '10:00:00'),
(3, 1, 20, '2026-01-01', '10:00:00', '12:00:00');

INSERT INTO users_subjects (user_id, subject_id) VALUES
(2, 1),
(2, 2),
(3, 1),
(3, 2),
(4, 2),
(4, 1);

INSERT INTO practice_groups_users (group_id, user_id) VALUES
(1, 2),
(2, 4),
(5, 2),
(5, 4),
(4, 4),
(4, 2);

INSERT INTO submissions (user_id, practice_id, delivery_date, grade) VALUES
(2, 1, '2023-01-01', 10),
(4, 2, '2026-01-02', NULL),
(2, 2, '2026-12-31', NULL);

UPDATE submissions SET feedback = 'Buen trabajo' WHERE id = 1;
UPDATE submissions SET evaluator_grade = 8 WHERE id = 2;

-- 2. Volver a activar las restricciones de claves foráneas
SET FOREIGN_KEY_CHECKS = 1;

-- Show tables
SHOW TABLES;

-- Display sample data
SELECT * FROM users;
SELECT * FROM degrees;
SELECT * FROM subject;
SELECT * FROM v_subject;
SELECT * FROM practice;
SELECT * FROM practice_groups;
SELECT * FROM submissions;
SELECT * FROM users_subjects;
SELECT * FROM practice_groups_users;
