CREATE VIEW v_subject AS
SELECT s.id, s.name , s.course, d.name AS degree
FROM subject s
INNER JOIN degrees d ON s.degree_id = d.id;