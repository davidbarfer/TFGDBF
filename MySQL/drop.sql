-- Drop Triggers if exist
DROP TRIGGER IF EXISTS create_group;
DROP TRIGGER IF EXISTS delete_group;
DROP TRIGGER IF EXISTS delete_user_group;
DROP TRIGGER IF EXISTS update_user_group_count;
DROP TRIGGER IF EXISTS check_user_already_in_group;
DROP TRIGGER IF EXISTS check_user_already_in_group_of_practice;

-- Drop tables if they exist (for fresh start)
DROP TABLE IF EXISTS users_subjects;
DROP TABLE IF EXISTS practice_groups_users;
DROP TABLE IF EXISTS practice_groups;
DROP TABLE IF EXISTS submissions;
DROP TABLE IF EXISTS practice;
DROP TABLE IF EXISTS subject;
DROP TABLE IF EXISTS saml_sessions;
DROP TABLE IF EXISTS users;