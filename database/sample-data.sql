-- Store Task & Checklist Manager - Sample Data
-- ============================================
-- NOTE: This script is OPTIONAL. The application's DataInitializer
-- automatically creates all seed data on startup for a fresh database.
--
-- Only run this if you need to reset seed data without restarting the app.
-- Run AFTER the application has started at least once (to ensure tables exist).
-- ============================================

-- Clear existing data (order matters for FK constraints)
DELETE FROM handovers;
DELETE FROM checklist_items;
DELETE FROM checklists;
DELETE FROM tasks;
DELETE FROM teams;
DELETE FROM projects;

-- ============================================
-- SHIFTS
-- ============================================
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
-- The bcrypt hash below is for 'password123'
-- ============================================
INSERT INTO users (username, password, first_name, last_name, email, phone, role, status, first_login, created_at, updated_at, shift_id)
SELECT 'john.manager', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'John', 'Smith', 'john@store.com', '555-0101', 'MANAGER', 'ACTIVE', false, NOW(), NOW(), (SELECT id FROM shifts WHERE shift_type = 'MORNING' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'john.manager');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, status, first_login, created_at, updated_at, shift_id)
SELECT 'sarah.lead', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Sarah', 'Johnson', 'sarah@store.com', '555-0102', 'TEAM_LEAD', 'ACTIVE', false, NOW(), NOW(), (SELECT id FROM shifts WHERE shift_type = 'MORNING' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'sarah.lead');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, status, first_login, created_at, updated_at, shift_id)
SELECT 'mike.staff', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Mike', 'Davis', 'mike@store.com', '555-0103', 'STAFF', 'ACTIVE', false, NOW(), NOW(), (SELECT id FROM shifts WHERE shift_type = 'EVENING' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'mike.staff');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, status, first_login, created_at, updated_at, shift_id)
SELECT 'emily.staff', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Emily', 'Brown', 'emily@store.com', '555-0104', 'STAFF', 'ACTIVE', false, NOW(), NOW(), (SELECT id FROM shifts WHERE shift_type = 'EVENING' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'emily.staff');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, status, first_login, created_at, updated_at, shift_id)
SELECT 'alex.staff', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Alex', 'Wilson', 'alex@store.com', '555-0105', 'STAFF', 'ACTIVE', false, NOW(), NOW(), (SELECT id FROM shifts WHERE shift_type = 'NIGHT' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'alex.staff');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, status, first_login, created_at, updated_at, shift_id)
SELECT 'lisa.staff', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Lisa', 'Martinez', 'lisa@store.com', '555-0106', 'STAFF', 'ACTIVE', false, NOW(), NOW(), (SELECT id FROM shifts WHERE shift_type = 'NIGHT' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'lisa.staff');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, status, first_login, created_at, updated_at, shift_id)
SELECT 'david.staff', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'David', 'Anderson', 'david@store.com', '555-0107', 'STAFF', 'ACTIVE', false, NOW(), NOW(), (SELECT id FROM shifts WHERE shift_type = 'MORNING' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'david.staff');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, status, first_login, created_at, updated_at, shift_id)
SELECT 'jenny.lead', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Jenny', 'Taylor', 'jenny@store.com', '555-0108', 'TEAM_LEAD', 'ACTIVE', false, NOW(), NOW(), (SELECT id FROM shifts WHERE shift_type = 'EVENING' LIMIT 1)
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'jenny.lead');

-- Update passwords for existing users
UPDATE users SET password = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', status = 'ACTIVE'
WHERE username IN ('john.manager', 'sarah.lead', 'mike.staff', 'emily.staff', 'alex.staff', 'lisa.staff', 'david.staff', 'jenny.lead');

-- ============================================
-- PROJECTS
-- ============================================
INSERT INTO projects (name, description, status, start_date, end_date, created_at, updated_at)
VALUES
('Store Website Revamp', 'Modernize the store website with new design and features', 'ACTIVE', '2026-03-01', '2026-09-30', NOW(), NOW()),
('Inventory Management System', 'Build a new inventory tracking and management system', 'ACTIVE', '2026-04-01', '2026-11-30', NOW(), NOW()),
('Customer Loyalty Program', 'Implement a new customer rewards and loyalty system', 'PLANNING', '2026-06-01', '2026-12-31', NOW(), NOW());

-- ============================================
-- TEAMS (requires users and projects to exist first)
-- ============================================
INSERT INTO teams (name, description, project_id, team_manager_id, team_lead_id, created_at, updated_at)
VALUES
('Frontend Team', 'Handles all frontend development',
 (SELECT id FROM projects WHERE name = 'Store Website Revamp'),
 (SELECT id FROM users WHERE username = 'john.manager'),
 (SELECT id FROM users WHERE username = 'sarah.lead'), NOW(), NOW()),

('Backend Team', 'Handles backend API and database development',
 (SELECT id FROM projects WHERE name = 'Store Website Revamp'),
 (SELECT id FROM users WHERE username = 'john.manager'),
 (SELECT id FROM users WHERE username = 'jenny.lead'), NOW(), NOW()),

('QA Team', 'Testing and quality assurance',
 (SELECT id FROM projects WHERE name = 'Store Website Revamp'),
 (SELECT id FROM users WHERE username = 'john.manager'),
 (SELECT id FROM users WHERE username = 'sarah.lead'), NOW(), NOW()),

('Inventory Team', 'Inventory system development and maintenance',
 (SELECT id FROM projects WHERE name = 'Inventory Management System'),
 (SELECT id FROM users WHERE username = 'john.manager'),
 (SELECT id FROM users WHERE username = 'jenny.lead'), NOW(), NOW());

-- Assign team members
UPDATE users SET team_id = (SELECT id FROM teams WHERE name = 'Frontend Team') WHERE username IN ('mike.staff', 'alex.staff');
UPDATE users SET team_id = (SELECT id FROM teams WHERE name = 'QA Team') WHERE username IN ('emily.staff', 'lisa.staff');
UPDATE users SET team_id = (SELECT id FROM teams WHERE name = 'Inventory Team') WHERE username = 'david.staff';
UPDATE users SET team_id = (SELECT id FROM teams WHERE name = 'Frontend Team') WHERE username = 'sarah.lead';
UPDATE users SET team_id = (SELECT id FROM teams WHERE name = 'Backend Team') WHERE username = 'jenny.lead';

-- ============================================
-- TASKS
-- ============================================
INSERT INTO tasks (title, description, status, priority, project_id, team_id, assigned_to_id, created_by_id, due_date, created_at, updated_at)
VALUES
('Design new homepage layout', 'Create wireframes and mockups for the new homepage', 'COMPLETED', 'HIGH',
 (SELECT id FROM projects WHERE name = 'Store Website Revamp'),
 (SELECT id FROM teams WHERE name = 'Frontend Team'),
 (SELECT id FROM users WHERE username = 'mike.staff'),
 (SELECT id FROM users WHERE username = 'admin'), NOW() - INTERVAL '30 days', NOW(), NOW()),

('Implement React components', 'Build reusable React components',
 'IN_PROGRESS', 'HIGH',
 (SELECT id FROM projects WHERE name = 'Store Website Revamp'),
 (SELECT id FROM teams WHERE name = 'Frontend Team'),
 (SELECT id FROM users WHERE username = 'mike.staff'),
 (SELECT id FROM users WHERE username = 'sarah.lead'), NOW() + INTERVAL '5 days', NOW(), NOW()),

('Set up REST API endpoints', 'Create API endpoints for user auth and data',
 'COMPLETED', 'HIGH',
 (SELECT id FROM projects WHERE name = 'Store Website Revamp'),
 (SELECT id FROM teams WHERE name = 'Backend Team'),
 (SELECT id FROM users WHERE username = 'sarah.lead'),
 (SELECT id FROM users WHERE username = 'admin'), NOW() - INTERVAL '25 days', NOW(), NOW()),

('Database schema design', 'Design and implement database schema',
 'COMPLETED', 'MEDIUM',
 (SELECT id FROM projects WHERE name = 'Store Website Revamp'),
 (SELECT id FROM teams WHERE name = 'Backend Team'),
 (SELECT id FROM users WHERE username = 'jenny.lead'),
 (SELECT id FROM users WHERE username = 'admin'), NOW() - INTERVAL '35 days', NOW(), NOW()),

('Write unit tests', 'Create unit tests for all components',
 'IN_REVIEW', 'MEDIUM',
 (SELECT id FROM projects WHERE name = 'Store Website Revamp'),
 (SELECT id FROM teams WHERE name = 'QA Team'),
 (SELECT id FROM users WHERE username = 'emily.staff'),
 (SELECT id FROM users WHERE username = 'mike.staff'), NOW() + INTERVAL '3 days', NOW(), NOW()),

('Integration testing', 'Test API integration with frontend',
 'TESTING', 'HIGH',
 (SELECT id FROM projects WHERE name = 'Store Website Revamp'),
 (SELECT id FROM teams WHERE name = 'QA Team'),
 (SELECT id FROM users WHERE username = 'emily.staff'),
 (SELECT id FROM users WHERE username = 'sarah.lead'), NOW() + INTERVAL '7 days', NOW(), NOW()),

('Inventory database design', 'Design database tables for inventory tracking',
 'IN_PROGRESS', 'HIGH',
 (SELECT id FROM projects WHERE name = 'Inventory Management System'),
 (SELECT id FROM teams WHERE name = 'Inventory Team'),
 (SELECT id FROM users WHERE username = 'jenny.lead'),
 (SELECT id FROM users WHERE username = 'john.manager'), NOW() + INTERVAL '10 days', NOW(), NOW()),

('Stock management API', 'Build REST API for stock management',
 'TODO', 'MEDIUM',
 (SELECT id FROM projects WHERE name = 'Inventory Management System'),
 (SELECT id FROM teams WHERE name = 'Inventory Team'),
 (SELECT id FROM users WHERE username = 'david.staff'),
 (SELECT id FROM users WHERE username = 'john.manager'), NOW() + INTERVAL '20 days', NOW(), NOW());

-- ============================================
-- CHECKLISTS
-- ============================================
INSERT INTO checklists (title, description, shift_id, team_id, created_by_id, created_at, updated_at)
VALUES
('Morning Shift Checklist - Store', 'Daily opening tasks for morning shift',
 (SELECT id FROM shifts WHERE shift_type = 'MORNING'),
 (SELECT id FROM teams WHERE name = 'Frontend Team'),
 (SELECT id FROM users WHERE username = 'sarah.lead'), NOW(), NOW()),

('Evening Shift Checklist - Store', 'Daily closing tasks for evening shift',
 (SELECT id FROM shifts WHERE shift_type = 'EVENING'),
 (SELECT id FROM teams WHERE name = 'Frontend Team'),
 (SELECT id FROM users WHERE username = 'sarah.lead'), NOW(), NOW()),

('Morning Shift Checklist - Warehouse', 'Daily warehouse opening tasks',
 (SELECT id FROM shifts WHERE shift_type = 'MORNING'),
 (SELECT id FROM teams WHERE name = 'Inventory Team'),
 (SELECT id FROM users WHERE username = 'jenny.lead'), NOW(), NOW()),

('Evening Shift Checklist - Warehouse', 'Daily warehouse closing tasks',
 (SELECT id FROM shifts WHERE shift_type = 'EVENING'),
 (SELECT id FROM teams WHERE name = 'Inventory Team'),
 (SELECT id FROM users WHERE username = 'jenny.lead'), NOW(), NOW());

-- ============================================
-- CHECKLIST ITEMS
-- ============================================
INSERT INTO checklist_items (title, description, completed, checklist_id, assigned_to_id, created_at, updated_at)
VALUES
('Check all entrances', 'Verify all doors are unlocked and secure', false,
 (SELECT id FROM checklists WHERE title = 'Morning Shift Checklist - Store'),
 (SELECT id FROM users WHERE username = 'mike.staff'), NOW(), NOW()),

('Verify POS systems online', 'Ensure all register systems are working', false,
 (SELECT id FROM checklists WHERE title = 'Morning Shift Checklist - Store'),
 (SELECT id FROM users WHERE username = 'mike.staff'), NOW(), NOW()),

('Team briefing', 'Conduct morning team meeting', true,
 (SELECT id FROM checklists WHERE title = 'Morning Shift Checklist - Store'),
 (SELECT id FROM users WHERE username = 'sarah.lead'), NOW(), NOW()),

('Cash reconciliation', 'Count and reconcile daily receipts', false,
 (SELECT id FROM checklists WHERE title = 'Evening Shift Checklist - Store'),
 (SELECT id FROM users WHERE username = 'mike.staff'), NOW(), NOW()),

('Clean and sanitize', 'End-of-day cleaning tasks', false,
 (SELECT id FROM checklists WHERE title = 'Evening Shift Checklist - Store'),
 (SELECT id FROM users WHERE username = 'emily.staff'), NOW(), NOW()),

('Receive shipments', 'Process incoming deliveries', false,
 (SELECT id FROM checklists WHERE title = 'Morning Shift Checklist - Warehouse'),
 (SELECT id FROM users WHERE username = 'david.staff'), NOW(), NOW()),

('Update inventory log', 'Log all received items in the system', true,
 (SELECT id FROM checklists WHERE title = 'Morning Shift Checklist - Warehouse'),
 (SELECT id FROM users WHERE username = 'david.staff'), NOW(), NOW()),

('Stock count', 'Count and verify stock levels for high-value items', false,
 (SELECT id FROM checklists WHERE title = 'Evening Shift Checklist - Warehouse'),
 (SELECT id FROM users WHERE username = 'david.staff'), NOW(), NOW());

-- ============================================
-- HANDOVERS
-- ============================================
INSERT INTO handovers (title, completed_work, pending_work, blockers, next_shift_instructions,
  from_shift_id, to_shift_id, assigned_team_id, receiving_team_id,
  created_by_id, resolved, acknowledged, acknowledged_at, priority, created_at, updated_at)
VALUES
('Evening to Night Handover',
 'Completed all evening POS closing. Processed 150 transactions.',
 'Complete inventory count for section B. Review pending support tickets.',
 'Waiting for vendor delivery - shelf restocking pending.',
 'Check delivery status. Section B count if time permits.',
 (SELECT id FROM shifts WHERE shift_type = 'EVENING'),
 (SELECT id FROM shifts WHERE shift_type = 'NIGHT'),
 (SELECT id FROM teams WHERE name = 'Frontend Team'),
 (SELECT id FROM teams WHERE name = 'Inventory Team'),
 (SELECT id FROM users WHERE username = 'mike.staff'), false, false, NULL, 'MEDIUM', NOW(), NOW()),

('Night to Morning Handover',
 'Completed security rounds. Verified all systems offline.',
 'Morning team to unlock and activate POS systems.',
 NULL,
 'All clear for morning. Restock coffee supplies.',
 (SELECT id FROM shifts WHERE shift_type = 'NIGHT'),
 (SELECT id FROM shifts WHERE shift_type = 'MORNING'),
 (SELECT id FROM teams WHERE name = 'Inventory Team'),
 (SELECT id FROM teams WHERE name = 'Frontend Team'),
 (SELECT id FROM users WHERE username = 'alex.staff'), false, false, NULL, 'MEDIUM', NOW(), NOW()),

('Morning to Evening Handover',
 'Opened store on time. Processed 120 transactions before noon.',
 'Evening team to complete end-of-day reconciliation.',
 'One shelf needs restocking - running low on popular items.',
 'Restock from back room. Complete close by 10pm.',
 (SELECT id FROM shifts WHERE shift_type = 'MORNING'),
 (SELECT id FROM shifts WHERE shift_type = 'EVENING'),
 (SELECT id FROM teams WHERE name = 'Frontend Team'),
 (SELECT id FROM teams WHERE name = 'Frontend Team'),
 (SELECT id FROM users WHERE username = 'sarah.lead'), true, true, NOW(), 'MEDIUM', NOW(), NOW());

-- ============================================
-- VERIFICATION
-- ============================================
SELECT 'Seed data loaded successfully!' AS status;
SELECT COUNT(*) || ' users' FROM users;
SELECT COUNT(*) || ' projects' FROM projects;
SELECT COUNT(*) || ' teams' FROM teams;
SELECT COUNT(*) || ' tasks' FROM tasks;
SELECT COUNT(*) || ' checklists' FROM checklists;
SELECT COUNT(*) || ' checklist items' FROM checklist_items;
SELECT COUNT(*) || ' handovers' FROM handovers;
