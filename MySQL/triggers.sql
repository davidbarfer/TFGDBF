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
    SET MESSAGE_TEXT = 'Cannot add user to group: group is already full';
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
    SET MESSAGE_TEXT = 'User is already in this group';
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
    SET MESSAGE_TEXT = 'User is already in a group of this practice';
  END IF;
END//

CREATE TRIGGER check_group_date_after_practice_deadline
BEFORE INSERT ON practice_groups
FOR EACH ROW
BEGIN
  DECLARE deadline_var DATE;
  DECLARE practice_count INT;
  
  -- Check if practice exists
  SELECT COUNT(*) INTO practice_count 
  FROM practice 
  WHERE id = NEW.practice_id;
  
  IF practice_count = 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Invalid practice_id: Practice does not exist';
  ELSE
    -- Get the deadline
    SELECT deadline INTO deadline_var 
    FROM practice 
    WHERE id = NEW.practice_id;
    
    -- Check for NULL dates
    IF NEW.practice_group_date IS NULL THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'practice_group_date cannot be NULL';
    ELSEIF deadline_var IS NULL THEN
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Practice deadline is not set';
    -- Check the date condition
    ELSEIF NEW.practice_group_date >= deadline_var THEN
      SET @message = CONCAT('Group date (', NEW.practice_group_date, 
                           ') must be before practice deadline (', 
                           deadline_var, ')');
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = @message;
    END IF;
  END IF;
END//

-- Groups of the same practice cannot exist on the same time at the same day
CREATE TRIGGER check_groups_dates_compability
BEFORE INSERT ON practice_groups
FOR EACH ROW
BEGIN
  DECLARE practice_count INT;
  
  -- Check if practice exists
  SELECT COUNT(*) INTO practice_count 
  FROM practice 
  WHERE id = NEW.practice_id;
  
  IF practice_count = 0 THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Invalid practice_id: Practice does not exist';
  ELSE
    -- Check for time overlaps with existing groups of the same practice on the same day
    -- An overlap occurs if:
    -- 1. New group starts during an existing group
    -- 2. New group ends during an existing group
    -- 3. New group completely contains an existing group
    IF EXISTS (
      SELECT 1 
      FROM practice_groups pg
      WHERE pg.practice_id = NEW.practice_id
        AND pg.practice_group_date = NEW.practice_group_date
        AND pg.id != NEW.id  -- For updates, don't compare with self
        AND (
          -- New group starts during existing group
          (NEW.start_time >= pg.start_time AND NEW.start_time < pg.end_time) OR
          -- New group ends during existing group
          (NEW.end_time > pg.start_time AND NEW.end_time <= pg.end_time) OR
          -- New group completely contains existing group
          (NEW.start_time <= pg.start_time AND NEW.end_time >= pg.end_time)
        )
    ) THEN
      SET @message = CONCAT('Time slot conflicts with another group of the same practice on ', 
                           NEW.practice_group_date);
      SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = @message;
    END IF;
  END IF;
END//

CREATE TRIGGER submission_insert
BEFORE INSERT ON submissions  -- Remove quotes around table name
FOR EACH ROW
BEGIN
  DECLARE practice_deadline DATETIME;
  SELECT deadline INTO practice_deadline FROM practice WHERE id = NEW.practice_id;
  
  IF EXISTS (
    SELECT 1 
    FROM submissions 
    WHERE user_id = NEW.user_id 
      AND practice_id = NEW.practice_id
  ) THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'User already has a submission for this practice';
  ELSEIF (NEW.delivery_date > practice_deadline) THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Submission after practice deadline not allowed';
  END IF;
END//

CREATE TRIGGER submission_update
BEFORE UPDATE ON submissions  -- Remove quotes around table name
FOR EACH ROW
BEGIN
  DECLARE practice_deadline DATETIME;
  SELECT deadline INTO practice_deadline FROM practice WHERE id = NEW.practice_id;
  
  IF NEW.delivery_date > practice_deadline THEN
    SIGNAL SQLSTATE '45000'
    SET MESSAGE_TEXT = 'Submission after practice deadline not allowed';
  END IF;
END//

-- Reset delimiter back to default
DELIMITER ;