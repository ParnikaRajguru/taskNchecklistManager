-- Store Task & Checklist Manager - Database Initialization Script
-- Run this script in PostgreSQL to create initial admin user and shifts

-- Create database (if not exists)
-- CREATE DATABASE taskmanager;

-- Shifts will be created automatically by the application when it starts
-- But you can manually insert initial data here if needed

-- Note: The first admin user must be created through the API
-- POST /api/auth/create-user with role SUPER_ADMIN

-- Sample shifts (run these after tables are created)
-- INSERT INTO shifts (name, shift_type, start_time, end_time, active, created_at, updated_at) VALUES
-- ('Morning Shift', 'MORNING', '06:00:00', '14:00:00', true, NOW(), NOW()),
-- ('Evening Shift', 'EVENING', '14:00:00', '22:00:00', true, NOW(), NOW()),
-- ('Night Shift', 'NIGHT', '22:00:00', '06:00:00', true, NOW(), NOW());

-- After creating user, you can assign shifts
-- UPDATE users SET shift_id = 1 WHERE username = 'admin';