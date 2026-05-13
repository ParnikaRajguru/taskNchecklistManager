-- DEBUG: Check what's in the database
-- Run this to see current state

-- 1. Check all users
SELECT id, username, email, role, active, first_login FROM users ORDER BY id;

-- 2. Check shifts
SELECT id, name, shift_type FROM shifts;

-- 3. Try to find emily.tester specifically
SELECT * FROM users WHERE username = 'emily.tester';

-- ============================================
-- FIX: If user doesn't exist, create them
-- ============================================

-- Check if emily.tester exists, if not create
INSERT INTO users (username, password, first_name, last_name, email, phone, role, active, first_login, created_at, updated_at, shift_id)
SELECT 
    'emily.tester',
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue',
    'Emily',
    'Brown',
    'emily@store.com',
    '555-0104',
    'TESTER',
    true,
    false,
    NOW(),
    NOW(),
    (SELECT id FROM shifts WHERE shift_type = 'EVENING' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'emily.tester');

-- Also create other missing users
INSERT INTO users (username, password, first_name, last_name, email, phone, role, active, first_login, created_at, updated_at, shift_id)
SELECT 'john.manager', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'John', 'Smith', 'john@store.com', '555-0101', 'MANAGER', true, false, NOW(), NOW(), (SELECT id FROM shifts WHERE shift_type = 'MORNING' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'john.manager');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, active, first_login, created_at, updated_at, shift_id)
SELECT 'sarah.lead', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Sarah', 'Johnson', 'sarah@store.com', '555-0102', 'TEAM_LEAD', true, false, NOW(), NOW(), (SELECT id FROM shifts WHERE shift_type = 'MORNING' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'sarah.lead');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, active, first_login, created_at, updated_at, shift_id)
SELECT 'mike.dev', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Mike', 'Davis', 'mike@store.com', '555-0103', 'DEVELOPER', true, false, NOW(), NOW(), (SELECT id FROM shifts WHERE shift_type = 'EVENING' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'mike.dev');

-- ============================================
-- If users exist but password is wrong, update
-- ============================================

UPDATE users SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', first_login = false 
WHERE username IN ('john.manager', 'sarah.lead', 'mike.dev', 'emily.tester');

-- Final verification
SELECT username, role, active FROM users ORDER BY id;