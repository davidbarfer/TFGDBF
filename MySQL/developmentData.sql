-- 1. Desactivar restricciones temporalmente para poder insertar/limpiar en cualquier orden
SET FOREIGN_KEY_CHECKS = 0;

-- Insert sample data
INSERT INTO users (username, password, password_salt, role, name, surname, is_active) VALUES
('adminEvaluaLab', '$2b$12$W16liLOZR6U4Zp3iptOPEOPNCl8ob/ieZqmEkdOWrrD5yo3qYK5xW',12,'admin', 'David', 'Barrero', TRUE),
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

-- Forzamos los IDs para asegurar que el escenario de pruebas cuadre perfectamente
INSERT INTO subject (id, name, course, degree_id, is_deleted) VALUES
(1, 'Fundametos de Control Automático', 2, 1, FALSE),
(2, 'Complentos de Control', 4, 1, FALSE),
(3, 'Asignatura Fantasma de Prueba (BORRADA)', 3, 2, TRUE) -- <-- ASIGNATURA ELIMINADA
ON DUPLICATE KEY UPDATE name = VALUES(name), course = VALUES(course), degree_id = VALUES(degree_id), is_deleted = VALUES(is_deleted); 

INSERT INTO practice (id, subject_id, name, description, deadline) VALUES
(1, 1, 'Control PI', 'Diseñe un control PI', '2025-12-31'),
(2, 2, 'Control GPC', 'Diseñe un control GPC', '2028-12-31'),
(3, 1, 'Control Test', 'Diseñe un control Test', '2028-12-31'),
(4, 3, 'Práctica Prohibida', 'No deberías poder interactuar conmigo', '2026-12-31') -- <-- PRÁCTICA EN ASIGNATURA BORRADA
ON DUPLICATE KEY UPDATE subject_id = VALUES(subject_id), name = VALUES(name), description = VALUES(description), deadline = VALUES(deadline);

-- Nota: Cambiado el nombre del grupo 6 a 99 (entero) para cumplir con el tipo NUMERIC de la tabla
INSERT INTO practice_groups (id, practice_id, name, max_participants, practice_group_date, start_time, end_time) VALUES
(1, 1, 1, 10, '2025-09-17', '08:00:00', '10:00:00'),
(2, 1, 2, 15, '2025-09-17', '10:00:00', '12:00:00'),
(3, 1, 3, 20, '2025-09-17', '12:00:00', '14:00:00'),
(4, 2, 1, 20, '2025-08-17', '08:00:00', '10:00:00'),
(5, 3, 1, 20, '2026-01-01', '10:00:00', '12:00:00'),
(6, 4, 99, 10, '2026-07-10', '16:00:00', '18:00:00') -- <-- GRUPO EN PRÁCTICA ELIMINADA
ON DUPLICATE KEY UPDATE practice_id = VALUES(practice_id), name = VALUES(name), max_participants = VALUES(max_participants), practice_group_date = VALUES(practice_group_date), start_time = VALUES(start_time), end_time = VALUES(end_time);

INSERT INTO users_subjects (user_id, subject_id) VALUES
(2, 1),
(2, 2),
(2, 3), -- Matrícula alumno 2 en asignatura borrada
(3, 1),
(3, 2),
(4, 2),
(4, 1),
(4, 3)  -- Matrícula alumno 4 en asignatura borrada
ON DUPLICATE KEY UPDATE user_id = user_id;

INSERT INTO practice_groups_users (group_id, user_id) VALUES
(1, 2),
(2, 4),
(5, 2),
(5, 4),
(4, 4),
(4, 2),
(6, 2), -- Alumno 2 en grupo zombi
(6, 4)  -- Alumno 4 en grupo zombi
ON DUPLICATE KEY UPDATE group_id = group_id;

INSERT INTO submissions (id, user_id, practice_id, delivery_date, grade) VALUES
(1, 2, 1, '2023-01-01', 10),
(2, 4, 2, '2026-01-02', NULL),
(3, 2, 2, '2026-12-31', NULL),
(4, 2, 4, '2026-07-15', NULL) -- <-- ENTREGA EN PRÁCTICA ELIMINADA
ON DUPLICATE KEY UPDATE user_id = VALUES(user_id), practice_id = VALUES(practice_id), delivery_date = VALUES(delivery_date), grade = VALUES(grade);

UPDATE submissions SET feedback = 'Buen trabajo' WHERE id = 1;
UPDATE submissions SET evaluator_grade = 8 WHERE id = 2;
UPDATE practice_groups SET description = 'Aula 007' WHERE id = 5;

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