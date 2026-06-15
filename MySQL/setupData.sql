SET FOREIGN_KEY_CHECKS = 0;

INSERT INTO users (username, password, password_salt, role, name, surname, is_active) VALUES
('admin', '$2b$12$W16liLOZR6U4Zp3iptOPEOPNCl8ob/ieZqmEkdOWrrD5yo3qYK5xW',12,'admin', 'Admin', 'Barrero', TRUE),
('professor', '$2b$12$W16liLOZR6U4Zp3iptOPEOPNCl8ob/ieZqmEkdOWrrD5yo3qYK5xW',12,'professor', 'David', 'Barrero', TRUE),
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

SET FOREIGN_KEY_CHECKS = 1;