-- Drop View if exist
DROP VIEW IF EXISTS v_subject;
-- Drop Procedures if exist
DROP PROCEDURE IF EXISTS validate_group_date;
DROP PROCEDURE IF EXISTS validate_group_time_compatibility;
-- Drop Triggers if exist
DROP TRIGGER IF EXISTS create_group;
DROP TRIGGER IF EXISTS delete_group;
DROP TRIGGER IF EXISTS delete_user_group;
DROP TRIGGER IF EXISTS update_user_group_count;
DROP TRIGGER IF EXISTS check_user_already_in_group;
DROP TRIGGER IF EXISTS check_user_already_in_group_of_practice;
DROP TRIGGER IF EXISTS check_group_date_after_practice_deadline;
DROP TRIGGER IF EXISTS check_groups_dates_compability;
DROP TRIGGER IF EXISTS submission_insert;
DROP TRIGGER IF EXISTS submission_update;

-- Drop tables if they exist (for fresh start)
DROP TABLE IF EXISTS users_subjects;
DROP TABLE IF EXISTS practice_groups_users;
DROP TABLE IF EXISTS practice_groups;
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS practice;
DROP TABLE IF EXISTS subject;
DROP TABLE IF EXISTS saml_sessions;
DROP TABLE IF EXISTS users;