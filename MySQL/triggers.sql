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

-- Reset delimiter back to default
DELIMITER ;