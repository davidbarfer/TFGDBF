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

CREATE TRIGGER delete_user_group
AFTER DELETE ON practice_groups_users
FOR EACH ROW
BEGIN
  UPDATE practice_groups SET current_participants = current_participants - 1 WHERE id = OLD.group_id;
END//

CREATE TRIGGER update_user_group_count
BEFORE INSERT ON practice_groups_users
FOR EACH ROW
BEGIN
  DECLARE current_count INT;
  DECLARE max_count INT;
  
  -- Get current and max participants for the group
  SELECT current_participants, max_participants 
  INTO current_count, max_count
  FROM practice_groups 
  WHERE id = NEW.group_id;
  
  -- Check if group is full
  IF current_count >= max_count THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Usuario no puede ser agregado. Grupo lleno';
  ELSE
    -- Increment the participant count
    UPDATE practice_groups 
    SET current_participants = current_participants + 1 
    WHERE id = NEW.group_id;
  END IF;
END//

CREATE TRIGGER check_user_already_in_group
BEFORE INSERT ON practice_groups_users
FOR EACH ROW
BEGIN
  IF EXISTS (SELECT 1 FROM practice_groups_users WHERE group_id = NEW.group_id AND user_id = NEW.user_id) THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Usuario ya pertenece a este grupo';
  END IF;
END//

CREATE TRIGGER check_user_already_in_group_of_practice
BEFORE INSERT ON practice_groups_users
FOR EACH ROW
BEGIN
  DECLARE practice_id_var INT;
  
  -- Get the practice_id of the group being inserted into
  SELECT practice_id INTO practice_id_var 
  FROM practice_groups 
  WHERE id = NEW.group_id;
  
  -- Check if user is already in any group of this practice
  IF EXISTS (
    SELECT 1 
    FROM practice_groups_users pgu
    JOIN practice_groups pg ON pgu.group_id = pg.id
    WHERE pgu.user_id = NEW.user_id 
    AND pg.practice_id = practice_id_var
  ) THEN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'Usuario ya pertenece a un grupo de esta práctica';
  END IF;
END//

CREATE TRIGGER practice_groups_before_insert_deadline
BEFORE INSERT ON practice_groups
FOR EACH ROW
BEGIN
  CALL validate_group_date(NEW.practice_id, NEW.practice_group_date);
END//

CREATE TRIGGER practice_groups_before_update_deadline
BEFORE UPDATE ON practice_groups
FOR EACH ROW
BEGIN
  CALL validate_group_date(NEW.practice_id, NEW.practice_group_date);
END//

CREATE TRIGGER practice_groups_before_insert_time_compability
BEFORE INSERT ON practice_groups
FOR EACH ROW
BEGIN
    CALL validate_group_time_compatibility(NEW.start_time, NEW.end_time);
END//

CREATE TRIGGER practice_groups_before_update_time_compability
BEFORE UPDATE ON practice_groups
FOR EACH ROW
BEGIN
    CALL validate_group_time_compatibility(NEW.start_time, NEW.end_time);
END//

CREATE TRIGGER submission_insert
BEFORE INSERT ON submissions  -- Remove quotes around table name
FOR EACH ROW
BEGIN
  DECLARE practice_deadline DATE;
  DECLARE error_msg VARCHAR(255); -- Added variable for error message
  SELECT deadline INTO practice_deadline FROM practice WHERE id = NEW.practice_id;
  
  IF EXISTS (
    SELECT 1 
    FROM submissions 
    WHERE user_id = NEW.user_id 
      AND practice_id = NEW.practice_id
  ) THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Usuario ya tiene una entrega generada para esta práctica';
  ELSEIF (NEW.delivery_date > practice_deadline) THEN
    SET error_msg = CONCAT('Fecha de la entrega (', New.delivery_date, ') debe ser antes de la Fecha Límite Global (', practice_deadline, ')');
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = error_msg;
  END IF;
END//

CREATE TRIGGER submission_update
BEFORE UPDATE ON submissions  -- Remove quotes around table name
FOR EACH ROW
BEGIN
  DECLARE practice_deadline DATE;
  DECLARE error_msg VARCHAR(255); -- Added variable for error message
  SELECT deadline INTO practice_deadline FROM practice WHERE id = NEW.practice_id;
  
  IF (NEW.delivery_date > practice_deadline) THEN
    SET error_msg = CONCAT('Fecha de la entrega (', New.delivery_date, ') debe ser antes de la Fecha Límite Global (', practice_deadline, ')');
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = error_msg;
  END IF;
END//

-- Reset delimiter back to default
DELIMITER ;