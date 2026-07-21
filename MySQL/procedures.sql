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
    SET MESSAGE_TEXT = 'Invalid practice_id: Practice does not exist';
  ELSE
    -- Get the deadline
    SELECT deadline INTO deadline_var 
    FROM practice 
    WHERE id = p_practice_id;
    
    -- Check for NULL dates
    IF p_group_date IS NULL THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'practice_group_date cannot be NULL';
    ELSEIF deadline_var IS NULL THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Practice deadline is not set';
    -- Check the date condition
    ELSEIF p_group_date >= deadline_var THEN
      -- Construct the string into the variable first
      SET error_msg = CONCAT('Group date (', p_group_date, ') must be before practice deadline (', deadline_var, ')');
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = error_msg;
    END IF;
  END IF;
END//

DELIMITER ;