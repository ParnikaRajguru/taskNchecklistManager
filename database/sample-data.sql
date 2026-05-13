-- Store Task & Checklist Manager - Sample Data
-- IMPORTANT: Run this AFTER starting the application at least once
-- This ensures shifts are created by DataInitializer first

-- ============================================
-- Fix: Ensure shifts exist first (in case app not started yet)
-- ============================================

-- Create shifts if they don't exist (will fail silently if they do)
INSERT INTO shifts (name, shift_type, start_time, end_time, active, created_at, updated_at)
SELECT 'Morning Shift', 'MORNING', '06:00:00', '14:00:00', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM shifts WHERE shift_type = 'MORNING');

INSERT INTO shifts (name, shift_type, start_time, end_time, active, created_at, updated_at)
SELECT 'Evening Shift', 'EVENING', '14:00:00', '22:00:00', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM shifts WHERE shift_type = 'EVENING');

INSERT INTO shifts (name, shift_type, start_time, end_time, active, created_at, updated_at)
SELECT 'Night Shift', 'NIGHT', '22:00:00', '06:00:00', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM shifts WHERE shift_type = 'NIGHT');

-- ============================================
-- USERS (Password: password123)
-- bcrypt hash for 'password123' 
-- ============================================

-- Create emily.tester (main user you're trying to login with)
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

-- Create other users if they don't exist
INSERT INTO users (username, password, first_name, last_name, email, phone, role, active, first_login, created_at, updated_at, shift_id)
SELECT 'john.manager', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'John', 'Smith', 'john@store.com', '555-0101', 'MANAGER', true, false, NOW(), NOW(), (SELECT id FROM shifts WHERE shift_type = 'MORNING' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'john.manager');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, active, first_login, created_at, updated_at, shift_id)
SELECT 'sarah.lead', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Sarah', 'Johnson', 'sarah@store.com', '555-0102', 'TEAM_LEAD', true, false, NOW(), NOW(), (SELECT id FROM shifts WHERE shift_type = 'MORNING' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'sarah.lead');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, active, first_login, created_at, updated_at, shift_id)
SELECT 'mike.dev', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Mike', 'Davis', 'mike@store.com', '555-0103', 'DEVELOPER', true, false, NOW(), NOW(), (SELECT id FROM shifts WHERE shift_type = 'EVENING' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'mike.dev');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, active, first_login, created_at, updated_at, shift_id)
SELECT 'alex.dev', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Alex', 'Wilson', 'alex@store.com', '555-0105', 'DEVELOPER', true, false, NOW(), NOW(), (SELECT id FROM shifts WHERE shift_type = 'NIGHT' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'alex.dev');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, active, first_login, created_at, updated_at, shift_id)
SELECT 'lisa.tester', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Lisa', 'Martinez', 'lisa@store.com', '555-0106', 'TESTER', true, false, NOW(), NOW(), (SELECT id FROM shifts WHERE shift_type = 'NIGHT' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'lisa.tester');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, active, first_login, created_at, updated_at, shift_id)
SELECT 'david.dev', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'David', 'Anderson', 'david@store.com', '555-0107', 'DEVELOPER', true, false, NOW(), NOW(), (SELECT id FROM shifts WHERE shift_type = 'MORNING' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'david.dev');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, active, first_login, created_at, updated_at, shift_id)
SELECT 'jenny.lead', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Jenny', 'Taylor', 'jenny@store.com', '555-0108', 'TEAM_LEAD', true, false, NOW(), NOW(), (SELECT id FROM shifts WHERE shift_type = 'EVENING' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'jenny.lead');

-- If users exist, update their passwords to ensure they work
UPDATE users SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', first_login = false 
WHERE username IN ('john.manager', 'sarah.lead', 'mike.dev', 'emily.tester', 'alex.dev', 'lisa.tester', 'david.dev', 'jenny.lead');

-- ============================================
-- PROJECTS
-- ============================================

INSERT INTO projects (name, description, status, start_date, end_date, created_at, updated_at)
VALUES 
('Store Website Revamp', 'Modernize the store website with new design and features', 'ACTIVE', '2026-01-01', '2026-06-30', NOW(), NOW()),
('Inventory Management System', 'Build a new inventory tracking and management system', 'ACTIVE', '2026-02-01', '2026-08-31', NOW(), NOW()),
('Mobile App Development', 'Create a mobile app for store customers', 'PLANNING', '2026-04-01', '2026-12-31', NOW(), NOW()),
('Point of Sale Upgrade', 'Upgrade the POS system across all store locations', 'ON_HOLD', '2025-10-01', '2026-03-31', NOW(), NOW()),
('Customer Loyalty Program', 'Implement a new customer rewards and loyalty system', 'ACTIVE', '2026-03-01', '2026-09-30', NOW(), NOW());

-- ============================================
-- TEAMS
-- ============================================

INSERT INTO teams (name, description, project_id, team_lead_id, created_at, updated_at)
VALUES 
('Frontend Team', 'Handle all frontend development', 
 (SELECT id FROM projects WHERE name = 'Store Website Revamp' LIMIT 1),
 (SELECT id FROM users WHERE username = 'mike.dev' LIMIT 1), NOW(), NOW()),

('Backend Team', 'Handle backend API and database', 
 (SELECT id FROM projects WHERE name = 'Store Website Revamp' LIMIT 1),
 (SELECT id FROM users WHERE username = 'sarah.lead' LIMIT 1), NOW(), NOW()),

('QA Team', 'Testing and quality assurance', 
 (SELECT id FROM projects WHERE name = 'Store Website Revamp' LIMIT 1),
 (SELECT id FROM users WHERE username = 'jenny.lead' LIMIT 1), NOW(), NOW()),

('Inventory Team', 'Inventory system development', 
 (SELECT id FROM projects WHERE name = 'Inventory Management System' LIMIT 1),
 (SELECT id FROM users WHERE username = 'sarah.lead' LIMIT 1), NOW(), NOW()),

('Mobile Team', 'Mobile app development', 
 (SELECT id FROM projects WHERE name = 'Mobile App Development' LIMIT 1),
 (SELECT id FROM users WHERE username = 'mike.dev' LIMIT 1), NOW(), NOW());

-- ============================================
-- UPDATE USERS WITH TEAM ASSIGNMENTS
-- ============================================

UPDATE users SET team_id = (SELECT id FROM teams WHERE name = 'Frontend Team' LIMIT 1) WHERE username = 'mike.dev';
UPDATE users SET team_id = (SELECT id FROM teams WHERE name = 'QA Team' LIMIT 1) WHERE username = 'emily.tester';
UPDATE users SET team_id = (SELECT id FROM teams WHERE name = 'Frontend Team' LIMIT 1) WHERE username = 'alex.dev';
UPDATE users SET team_id = (SELECT id FROM teams WHERE name = 'QA Team' LIMIT 1) WHERE username = 'lisa.tester';
UPDATE users SET team_id = (SELECT id FROM teams WHERE name = 'Inventory Team' LIMIT 1) WHERE username = 'david.dev';
UPDATE users SET team_id = (SELECT id FROM teams WHERE name = 'Backend Team' LIMIT 1) WHERE username = 'jenny.lead';
UPDATE users SET team_id = (SELECT id FROM teams WHERE name = 'Backend Team' LIMIT 1) WHERE username = 'john.manager';
UPDATE users SET team_id = (SELECT id FROM teams WHERE name = 'Frontend Team' LIMIT 1) WHERE username = 'sarah.lead';

-- ============================================
-- TASKS
-- ============================================

INSERT INTO tasks (title, description, status, priority, project_id, team_id, assigned_to_id, created_by_id, due_date, created_at, updated_at)
VALUES 
('Design new homepage layout', 'Create wireframes and mockups for the new homepage design', 'COMPLETED', 'HIGH', 
 (SELECT id FROM projects WHERE name = 'Store Website Revamp' LIMIT 1),
 (SELECT id FROM teams WHERE name = 'Frontend Team' LIMIT 1),
 (SELECT id FROM users WHERE username = 'mike.dev' LIMIT 1),
 (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
 '2026-02-15', NOW(), NOW()),

('Implement React components', 'Build reusable React components for the website', 'IN_PROGRESS', 'HIGH', 
 (SELECT id FROM projects WHERE name = 'Store Website Revamp' LIMIT 1),
 (SELECT id FROM teams WHERE name = 'Frontend Team' LIMIT 1),
 (SELECT id FROM users WHERE username = 'mike.dev' LIMIT 1),
 (SELECT id FROM users WHERE username = 'sarah.lead' LIMIT 1),
 '2026-03-01', NOW(), NOW()),

('Set up REST API endpoints', 'Create API endpoints for user authentication and data', 'COMPLETED', 'HIGH', 
 (SELECT id FROM projects WHERE name = 'Store Website Revamp' LIMIT 1),
 (SELECT id FROM teams WHERE name = 'Backend Team' LIMIT 1),
 (SELECT id FROM users WHERE username = 'sarah.lead' LIMIT 1),
 (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
 '2026-02-20', NOW(), NOW()),

('Database schema design', 'Design and implement the database schema', 'COMPLETED', 'MEDIUM', 
 (SELECT id FROM projects WHERE name = 'Store Website Revamp' LIMIT 1),
 (SELECT id FROM teams WHERE name = 'Backend Team' LIMIT 1),
 (SELECT id FROM users WHERE username = 'jenny.lead' LIMIT 1),
 (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
 '2026-02-10', NOW(), NOW()),

('Write unit tests', 'Create unit tests for all new components', 'IN_REVIEW', 'MEDIUM', 
 (SELECT id FROM projects WHERE name = 'Store Website Revamp' LIMIT 1),
 (SELECT id FROM teams WHERE name = 'QA Team' LIMIT 1),
 (SELECT id FROM users WHERE username = 'emily.tester' LIMIT 1),
 (SELECT id FROM users WHERE username = 'mike.dev' LIMIT 1),
 '2026-03-10', NOW(), NOW()),

('Integration testing', 'Test API integration with frontend', 'TESTING', 'HIGH', 
 (SELECT id FROM projects WHERE name = 'Store Website Revamp' LIMIT 1),
 (SELECT id FROM teams WHERE name = 'QA Team' LIMIT 1),
 (SELECT id FROM users WHERE username = 'emily.tester' LIMIT 1),
 (SELECT id FROM users WHERE username = 'sarah.lead' LIMIT 1),
 '2026-03-15', NOW(), NOW()),

('Requirements gathering', 'Meet with stakeholders to gather requirements', 'COMPLETED', 'HIGH', 
 (SELECT id FROM projects WHERE name = 'Inventory Management System' LIMIT 1),
 (SELECT id FROM teams WHERE name = 'Inventory Team' LIMIT 1),
 (SELECT id FROM users WHERE username = 'sarah.lead' LIMIT 1),
 (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
 '2026-02-28', NOW(), NOW()),

('Database design for inventory', 'Design database tables for inventory tracking', 'IN_PROGRESS', 'HIGH', 
 (SELECT id FROM projects WHERE name = 'Inventory Management System' LIMIT 1),
 (SELECT id FROM teams WHERE name = 'Inventory Team' LIMIT 1),
 (SELECT id FROM users WHERE username = 'jenny.lead' LIMIT 1),
 (SELECT id FROM users WHERE username = 'john.manager' LIMIT 1),
 '2026-03-15', NOW(), NOW()),

('Mobile app wireframes', 'Design wireframes for mobile app screens', 'IN_PROGRESS', 'MEDIUM', 
 (SELECT id FROM projects WHERE name = 'Mobile App Development' LIMIT 1),
 (SELECT id FROM teams WHERE name = 'Mobile Team' LIMIT 1),
 (SELECT id FROM users WHERE username = 'mike.dev' LIMIT 1),
 (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
 '2026-04-15', NOW(), NOW()),

('Loyalty program requirements', 'Document program rules and point system', 'COMPLETED', 'HIGH', 
 (SELECT id FROM projects WHERE name = 'Customer Loyalty Program' LIMIT 1),
 (SELECT id FROM teams WHERE name = 'Backend Team' LIMIT 1),
 (SELECT id FROM users WHERE username = 'sarah.lead' LIMIT 1),
 (SELECT id FROM users WHERE username = 'admin' LIMIT 1),
 '2026-03-10', NOW(), NOW());

-- ============================================
-- CHECKLISTS
-- ============================================

INSERT INTO checklists (title, description, shift_id, team_id, created_by_id, created_at, updated_at)
VALUES 
('Morning Shift Checklist - Store', 'Daily opening tasks for morning shift', 
 (SELECT id FROM shifts WHERE shift_type = 'MORNING' LIMIT 1),
 (SELECT id FROM teams WHERE name = 'Frontend Team' LIMIT 1),
 (SELECT id FROM users WHERE username = 'sarah.lead' LIMIT 1), NOW(), NOW()),

('Evening Shift Checklist - Store', 'Daily closing tasks for evening shift', 
 (SELECT id FROM shifts WHERE shift_type = 'EVENING' LIMIT 1),
 (SELECT id FROM teams WHERE name = 'Frontend Team' LIMIT 1),
 (SELECT id FROM users WHERE username = 'sarah.lead' LIMIT 1), NOW(), NOW()),

('Morning Shift Checklist - Warehouse', 'Daily warehouse opening tasks', 
 (SELECT id FROM shifts WHERE shift_type = 'MORNING' LIMIT 1),
 (SELECT id FROM teams WHERE name = 'Inventory Team' LIMIT 1),
 (SELECT id FROM users WHERE username = 'jenny.lead' LIMIT 1), NOW(), NOW()),

('Evening Shift Checklist - Warehouse', 'Daily warehouse closing tasks', 
 (SELECT id FROM shifts WHERE shift_type = 'EVENING' LIMIT 1),
 (SELECT id FROM teams WHERE name = 'Inventory Team' LIMIT 1),
 (SELECT id FROM users WHERE username = 'jenny.lead' LIMIT 1), NOW(), NOW());

-- ============================================
-- CHECKLIST ITEMS
-- ============================================

INSERT INTO checklist_items (title, description, completed, checklist_id, assigned_to_id, task_id, created_at, updated_at)
VALUES 
('Check all entrances', 'Verify all doors are unlocked and secure', false, 
 (SELECT id FROM checklists WHERE title LIKE '%Morning%Store%' LIMIT 1),
 (SELECT id FROM users WHERE username = 'mike.dev' LIMIT 1), NULL, NOW(), NOW()),

('Verify POS systems online', 'Ensure all register systems are working', false, 
 (SELECT id FROM checklists WHERE title LIKE '%Morning%Store%' LIMIT 1),
 (SELECT id FROM users WHERE username = 'mike.dev' LIMIT 1), NULL, NOW(), NOW()),

('Team briefing', 'Conduct morning team meeting', true, 
 (SELECT id FROM checklists WHERE title LIKE '%Morning%Store%' LIMIT 1),
 (SELECT id FROM users WHERE username = 'sarah.lead' LIMIT 1), NULL, NOW(), NOW()),

('Cash reconciliation', 'Count and reconcile daily receipts', false, 
 (SELECT id FROM checklists WHERE title LIKE '%Evening%Store%' LIMIT 1),
 (SELECT id FROM users WHERE username = 'mike.dev' LIMIT 1), NULL, NOW(), NOW()),

('Clean and sanitize', 'End-of-day cleaning tasks', false, 
 (SELECT id FROM checklists WHERE title LIKE '%Evening%Store%' LIMIT 1),
 (SELECT id FROM users WHERE username = 'emily.tester' LIMIT 1), NULL, NOW(), NOW()),

('Receive shipments', 'Process incoming deliveries', false, 
 (SELECT id FROM checklists WHERE title LIKE '%Morning%Warehouse%' LIMIT 1),
 (SELECT id FROM users WHERE username = 'david.dev' LIMIT 1), NULL, NOW(), NOW());

-- ============================================
-- HANDOFFS
-- ============================================

INSERT INTO handovers (title, completed_work, pending_work, blockers, next_shift_instructions, from_shift_id, to_shift_id, created_by_id, resolved, created_at, updated_at)
VALUES 
('Evening to Night Handover', 
 'Completed all evening POS closing.',
 'Complete inventory count for section B.',
 'Waiting for vendor delivery.',
 'Check delivery. Section B count if time permits.',
 (SELECT id FROM shifts WHERE shift_type = 'EVENING' LIMIT 1),
 (SELECT id FROM shifts WHERE shift_type = 'NIGHT' LIMIT 1),
 (SELECT id FROM users WHERE username = 'mike.dev' LIMIT 1), false, NOW(), NOW()),

('Night to Morning Handover',
 'Completed security rounds.',
 'Morning team to unlock and activate POS.',
 NULL,
 'All clear for morning.',
 (SELECT id FROM shifts WHERE shift_type = 'NIGHT' LIMIT 1),
 (SELECT id FROM shifts WHERE shift_type = 'MORNING' LIMIT 1),
 (SELECT id FROM users WHERE username = 'alex.dev' LIMIT 1), false, NOW(), NOW()),

('Morning to Evening Handover',
 'Completed opening. Processed 120 transactions.',
 'Evening team to complete reconciliation.',
 'One shelf needs restocking.',
 'Restock from back room. Complete close by 10pm.',
 (SELECT id FROM shifts WHERE shift_type = 'MORNING' LIMIT 1),
 (SELECT id FROM shifts WHERE shift_type = 'EVENING' LIMIT 1),
 (SELECT id FROM users WHERE username = 'sarah.lead' LIMIT 1), false, NOW(), NOW());

-- ============================================
-- VERIFY
-- ============================================

SELECT 'Users created: ' || COUNT(*) FROM users WHERE username != 'admin';
SELECT 'Projects: ' || COUNT(*) FROM projects;
SELECT 'Teams: ' || COUNT(*) FROM teams;
SELECT 'Tasks: ' || COUNT(*) FROM tasks;

-- Show all users
SELECT username, role, active FROM users ORDER BY username;