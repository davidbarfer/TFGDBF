DELIMITER //

CREATE PROCEDURE validate_group_date(
    IN p_practice_id INT,
    IN p_group_date DATE
)
BEGIN
  DECLARE deadline_var DATE;
  DECLARE practice_count INT;
  DECLARE error_msg VARCHAR(255); -- Added variable for error message
  
  -- Check if practice exists
  SELECT COUNT(*) INTO practice_count 
  FROM practice 
  WHERE id = p_practice_id;
  
  IF practice_count = 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Practica no existe';
  ELSE
    -- Get the deadline
    SELECT deadline INTO deadline_var 
    FROM practice 
    WHERE id = p_practice_id;
    
    -- Check for NULL dates
    IF p_group_date IS NULL THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'La fecha del grupo no puede ser nula';
    ELSEIF deadline_var IS NULL THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Fecha límite global no puede ser nula';
    -- Check the date condition
    ELSEIF p_group_date >= deadline_var THEN
      -- Construct the string into the variable first
      SET error_msg = CONCAT('Fecha del grupo (', p_group_date, ') debe ser antes de la Fecha Límite Global (', deadline_var, ')');
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = error_msg;
    END IF;
  END IF;
END//

CREATE PROCEDURE validate_group_time_compatibility(
    IN g_start_time TIME,
    IN g_end_time TIME
)
BEGIN
    IF g_end_time < g_start_time THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Rango de horas invalido: Hora Fin no puede ser antes que Hora Inicio.';
    END IF;
END//

DELIMITER ;