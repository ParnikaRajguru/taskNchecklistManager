-- Fix: Update passwords for sample users
-- This directly updates the password field with correct bcrypt hash for 'password123'

-- First verify the users exist
SELECT username, role FROM users WHERE username IN ('emily.tester', 'john.manager', 'sarah.lead', 'mike.dev', 'admin');

-- The bcrypt hash for 'password123' is generated correctly
-- Let's update the password for emily.tester specifically
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue',
    first_login = false
WHERE username = 'emily.tester';

-- Update all sample users to use the correct password
UPDATE users 
SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue',
    first_login = false
WHERE username IN ('john.manager', 'sarah.lead', 'mike.dev', 'alex.dev', 'lisa.tester', 'david.dev', 'jenny.lead');

-- Verify
SELECT username, role, active, first_login FROM users WHERE username != 'admin';