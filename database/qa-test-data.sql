-- QA Test Data - Comprehensive Test Data for All Roles and Features
-- Run this AFTER application has started to load realistic test data

-- ============================================
-- CLEAR EXISTING TEST DATA (Keep original seed)
-- ============================================
-- Only clear data created by previous test runs
DELETE FROM handover_notes WHERE content LIKE 'QA_TEST%';
DELETE FROM notes WHERE content LIKE 'QA_TEST%';
DELETE FROM checklist_items WHERE title LIKE 'QA_%';
DELETE FROM checklists WHERE title LIKE 'QA_%';
DELETE FROM tasks WHERE title LIKE 'QA_%';
DELETE FROM teams WHERE name LIKE '% Team' AND name NOT IN ('Frontend Team', 'Backend Team', 'QA Team', 'Inventory Team');
DELETE FROM projects WHERE name LIKE '% System' OR name LIKE '% Platform' OR name LIKE '% Portal' OR name LIKE '% Revamp' OR name LIKE '% Migration';
DELETE FROM users WHERE username LIKE 'qa.%' OR username LIKE 'test.%';

-- ============================================
-- ADDITIONAL MANAGERS
-- ============================================
-- Password for all: password123 (bcrypt hash)
INSERT INTO users (username, password, first_name, last_name, email, phone, role, status, first_login, created_at, updated_at, shift_id, team_id, public_id)
SELECT 'qa.manager1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Robert', 'Chen', 'robert.chen@store.com', '555-0201', 'MANAGER', 'ACTIVE', false, NOW(), NOW(),
  (SELECT id FROM shifts WHERE shift_type = 'MORNING' LIMIT 1), NULL, 'USR-101'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'qa.manager1');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, status, first_login, created_at, updated_at, shift_id, team_id, public_id)
SELECT 'qa.manager2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Maria', 'Garcia', 'maria.garcia@store.com', '555-0202', 'MANAGER', 'ACTIVE', false, NOW(), NOW(),
  (SELECT id FROM shifts WHERE shift_type = 'EVENING' LIMIT 1), NULL, 'USR-102'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'qa.manager2');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, status, first_login, created_at, updated_at, shift_id, team_id, public_id)
SELECT 'qa.manager3', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'James', 'Wilson', 'james.wilson@store.com', '555-0203', 'MANAGER', 'ACTIVE', false, NOW(), NOW(),
  (SELECT id FROM shifts WHERE shift_type = 'NIGHT' LIMIT 1), NULL, 'USR-103'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'qa.manager3');

-- ============================================
-- ADDITIONAL TEAM LEADS
-- ============================================
INSERT INTO users (username, password, first_name, last_name, email, phone, role, status, first_login, created_at, updated_at, shift_id, team_id, public_id)
SELECT 'qa.lead1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Linda', 'Martinez', 'linda.martinez@store.com', '555-0301', 'TEAM_LEAD', 'ACTIVE', false, NOW(), NOW(),
  (SELECT id FROM shifts WHERE shift_type = 'MORNING' LIMIT 1), NULL, 'USR-104'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'qa.lead1');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, status, first_login, created_at, updated_at, shift_id, team_id, public_id)
SELECT 'qa.lead2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Kevin', 'Brown', 'kevin.brown@store.com', '555-0302', 'TEAM_LEAD', 'ACTIVE', false, NOW(), NOW(),
  (SELECT id FROM shifts WHERE shift_type = 'EVENING' LIMIT 1), NULL, 'USR-105'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'qa.lead2');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, status, first_login, created_at, updated_at, shift_id, team_id, public_id)
SELECT 'qa.lead3', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Patricia', 'Lee', 'patricia.lee@store.com', '555-0303', 'TEAM_LEAD', 'ACTIVE', false, NOW(), NOW(),
  (SELECT id FROM shifts WHERE shift_type = 'NIGHT' LIMIT 1), NULL, 'USR-106'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'qa.lead3');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, status, first_login, created_at, updated_at, shift_id, team_id, public_id)
SELECT 'qa.lead4', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Brian', 'Taylor', 'brian.taylor@store.com', '555-0304', 'TEAM_LEAD', 'ACTIVE', false, NOW(), NOW(),
  (SELECT id FROM shifts WHERE shift_type = 'MORNING' LIMIT 1), NULL, 'USR-107'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'qa.lead4');

-- ============================================
-- STAFF USERS
-- ============================================
INSERT INTO users (username, password, first_name, last_name, email, phone, role, status, first_login, created_at, updated_at, shift_id, team_id, public_id)
SELECT 'qa.staff1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Susan', 'Clark', 'susan.clark@store.com', '555-0401', 'STAFF', 'ACTIVE', false, NOW(), NOW(),
  (SELECT id FROM shifts WHERE shift_type = 'MORNING' LIMIT 1), NULL, 'USR-108'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'qa.staff1');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, status, first_login, created_at, updated_at, shift_id, team_id, public_id)
SELECT 'qa.staff2', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Thomas', 'Anderson', 'thomas.anderson@store.com', '555-0402', 'STAFF', 'ACTIVE', false, NOW(), NOW(),
  (SELECT id FROM shifts WHERE shift_type = 'MORNING' LIMIT 1), NULL, 'USR-109'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'qa.staff2');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, status, first_login, created_at, updated_at, shift_id, team_id, public_id)
SELECT 'qa.staff3', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Nancy', 'White', 'nancy.white@store.com', '555-0403', 'STAFF', 'ACTIVE', false, NOW(), NOW(),
  (SELECT id FROM shifts WHERE shift_type = 'EVENING' LIMIT 1), NULL, 'USR-110'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'qa.staff3');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, status, first_login, created_at, updated_at, shift_id, team_id, public_id)
SELECT 'qa.staff4', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Daniel', 'Harris', 'daniel.harris@store.com', '555-0404', 'STAFF', 'ACTIVE', false, NOW(), NOW(),
  (SELECT id FROM shifts WHERE shift_type = 'EVENING' LIMIT 1), NULL, 'USR-111'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'qa.staff4');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, status, first_login, created_at, updated_at, shift_id, team_id, public_id)
SELECT 'qa.staff5', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Karen', 'Miller', 'karen.miller@store.com', '555-0405', 'STAFF', 'ACTIVE', false, NOW(), NOW(),
  (SELECT id FROM shifts WHERE shift_type = 'NIGHT' LIMIT 1), NULL, 'USR-112'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'qa.staff5');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, status, first_login, created_at, updated_at, shift_id, team_id, public_id)
SELECT 'qa.staff6', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Mark', 'Davis', 'mark.davis@store.com', '555-0406', 'STAFF', 'ACTIVE', false, NOW(), NOW(),
  (SELECT id FROM shifts WHERE shift_type = 'NIGHT' LIMIT 1), NULL, 'USR-113'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'qa.staff6');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, status, first_login, created_at, updated_at, shift_id, team_id, public_id)
SELECT 'qa.staff7', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Laura', 'Robinson', 'laura.robinson@store.com', '555-0407', 'STAFF', 'ACTIVE', false, NOW(), NOW(),
  (SELECT id FROM shifts WHERE shift_type = 'MORNING' LIMIT 1), NULL, 'USR-114'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'qa.staff7');

INSERT INTO users (username, password, first_name, last_name, email, phone, role, status, first_login, created_at, updated_at, shift_id, team_id, public_id)
SELECT 'qa.staff8', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZRGdjGj/n3.zS4sE.qNvc1FCKU3ue', 'Steven', 'Walker', 'steven.walker@store.com', '555-0408', 'STAFF', 'ACTIVE', false, NOW(), NOW(),
  (SELECT id FROM shifts WHERE shift_type = 'EVENING' LIMIT 1), NULL, 'USR-115'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'qa.staff8');

-- ============================================
-- ADDITIONAL PROJECTS
-- ============================================
INSERT INTO projects (name, description, status, start_date, end_date, created_at, updated_at, public_id)
SELECT 'Inventory Management System', 'Build a comprehensive inventory tracking and management system with barcode scanning', 'ACTIVE', '2026-01-15', '2026-08-30', NOW(), NOW(), 'PRJ-101'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Inventory Management System');

INSERT INTO projects (name, description, status, start_date, end_date, created_at, updated_at, public_id)
SELECT 'Logistics Platform', 'Develop an integrated logistics and delivery tracking platform', 'ACTIVE', '2026-02-01', '2026-10-15', NOW(), NOW(), 'PRJ-102'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Logistics Platform');

INSERT INTO projects (name, description, status, start_date, end_date, created_at, updated_at, public_id)
SELECT 'Customer Portal', 'Create a customer self-service portal for order tracking and account management', 'PLANNING', '2026-05-01', '2026-12-31', NOW(), NOW(), 'PRJ-103'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Customer Portal');

INSERT INTO projects (name, description, status, start_date, end_date, created_at, updated_at, public_id)
SELECT 'Shipment Tracker', 'Real-time shipment tracking system with SMS notifications', 'ACTIVE', '2026-03-01', '2026-09-30', NOW(), NOW(), 'PRJ-104'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Shipment Tracker');

INSERT INTO projects (name, description, status, start_date, end_date, created_at, updated_at, public_id)
SELECT 'Database Migration', 'Migrate legacy database to new PostgreSQL cluster', 'IN_PROGRESS', '2026-04-01', '2026-07-30', NOW(), NOW(), 'PRJ-105'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Database Migration');

INSERT INTO projects (name, description, status, start_date, end_date, created_at, updated_at, public_id)
SELECT 'Employee Dashboard', 'Internal employee performance dashboard and analytics', 'ON_HOLD', '2026-06-01', '2026-11-30', NOW(), NOW(), 'PRJ-106'
WHERE NOT EXISTS (SELECT 1 FROM projects WHERE name = 'Employee Dashboard');

-- ============================================
-- ADDITIONAL TEAMS
-- ============================================
-- Logistics Team (Manager: qa.manager1, Lead: qa.lead1)
INSERT INTO teams (name, description, project_id, team_manager_id, team_lead_id, created_at, updated_at, public_id)
SELECT 'Logistics Team', 'Handles all logistics and delivery operations',
  (SELECT id FROM projects WHERE name = 'Logistics Platform'),
  (SELECT id FROM users WHERE username = 'qa.manager1'),
  (SELECT id FROM users WHERE username = 'qa.lead1'), NOW(), NOW(), 'TEAM-101'
WHERE NOT EXISTS (SELECT 1 FROM teams WHERE name = 'Logistics Team');

-- Support Team (Manager: qa.manager2, Lead: qa.lead2)
INSERT INTO teams (name, description, project_id, team_manager_id, team_lead_id, created_at, updated_at, public_id)
SELECT 'Support Team', 'Customer support and issue resolution',
  (SELECT id FROM projects WHERE name = 'Customer Portal'),
  (SELECT id FROM users WHERE username = 'qa.manager2'),
  (SELECT id FROM users WHERE username = 'qa.lead2'), NOW(), NOW(), 'TEAM-102'
WHERE NOT EXISTS (SELECT 1 FROM teams WHERE name = 'Support Team');

-- Security Team (Manager: qa.manager3, Lead: qa.lead3)
INSERT INTO teams (name, description, project_id, team_manager_id, team_lead_id, created_at, updated_at, public_id)
SELECT 'Security Team', 'Security monitoring and compliance',
  (SELECT id FROM projects WHERE name = 'Inventory Management System'),
  (SELECT id FROM users WHERE username = 'qa.manager3'),
  (SELECT id FROM users WHERE username = 'qa.lead3'), NOW(), NOW(), 'TEAM-103'
WHERE NOT EXISTS (SELECT 1 FROM teams WHERE name = 'Security Team');

-- Database Team (Manager: qa.manager1, Lead: qa.lead4)
INSERT INTO teams (name, description, project_id, team_manager_id, team_lead_id, created_at, updated_at, public_id)
SELECT 'Database Team', 'Database administration and migration',
  (SELECT id FROM projects WHERE name = 'Database Migration'),
  (SELECT id FROM users WHERE username = 'qa.manager1'),
  (SELECT id FROM users WHERE username = 'qa.lead4'), NOW(), NOW(), 'TEAM-104'
WHERE NOT EXISTS (SELECT 1 FROM teams WHERE name = 'Database Team');

-- ============================================
-- ASSIGN STAFF TO TEAMS
-- ============================================
UPDATE users SET team_id = (SELECT id FROM teams WHERE name = 'Logistics Team') WHERE username IN ('qa.staff1', 'qa.staff2', 'qa.staff3');
UPDATE users SET team_id = (SELECT id FROM teams WHERE name = 'Support Team') WHERE username IN ('qa.staff4', 'qa.staff5', 'qa.staff6');
UPDATE users SET team_id = (SELECT id FROM teams WHERE name = 'Security Team') WHERE username IN ('qa.staff7', 'qa.staff8');
UPDATE users SET team_id = (SELECT id FROM teams WHERE name = 'Database Team') WHERE username = 'qa.lead4';

-- ============================================
-- TASKS - Various statuses, priorities, overdue
-- ============================================
-- Logistics Team Tasks
INSERT INTO tasks (title, description, status, priority, project_id, team_id, assigned_to_id, created_by_id, due_date, created_at, updated_at)
VALUES
('QA_TEST_Set up delivery routing algorithm', 'Implement optimal delivery route calculation', 'COMPLETED', 'HIGH',
  (SELECT id FROM projects WHERE name = 'Logistics Platform'),
  (SELECT id FROM teams WHERE name = 'Logistics Team'),
  (SELECT id FROM users WHERE username = 'qa.staff1'),
  (SELECT id FROM users WHERE username = 'qa.manager1'), NOW() - INTERVAL '15 days', NOW(), NOW()),

('QA_TEST_Integrate GPS tracking API', 'Connect with third-party GPS tracking service', 'IN_PROGRESS', 'HIGH',
  (SELECT id FROM projects WHERE name = 'Logistics Platform'),
  (SELECT id FROM teams WHERE name = 'Logistics Team'),
  (SELECT id FROM users WHERE username = 'qa.staff2'),
  (SELECT id FROM users WHERE username = 'qa.lead1'), NOW() + INTERVAL '3 days', NOW(), NOW()),

('QA_TEST_Create delivery manifest UI', 'Design and implement delivery manifest interface', 'TODO', 'MEDIUM',
  (SELECT id FROM projects WHERE name = 'Logistics Platform'),
  (SELECT id FROM teams WHERE name = 'Logistics Team'),
  (SELECT id FROM users WHERE username = 'qa.staff3'),
  (SELECT id FROM users WHERE username = 'qa.lead1'), NOW() + INTERVAL '10 days', NOW(), NOW()),

('QA_TEST_Overdue: Driver assignment module', 'Complete driver assignment module - OVERDUE', 'BLOCKED', 'HIGH',
  (SELECT id FROM projects WHERE name = 'Logistics Platform'),
  (SELECT id FROM teams WHERE name = 'Logistics Team'),
  (SELECT id FROM users WHERE username = 'qa.staff1'),
  (SELECT id FROM users WHERE username = 'qa.manager1'), NOW() - INTERVAL '5 days', NOW() - INTERVAL '10 days', NOW());

-- Support Team Tasks
INSERT INTO tasks (title, description, status, priority, project_id, team_id, assigned_to_id, created_by_id, due_date, created_at, updated_at)
VALUES
('QA_TEST_Customer ticket system design', 'Design the customer support ticket system', 'COMPLETED', 'HIGH',
  (SELECT id FROM projects WHERE name = 'Customer Portal'),
  (SELECT id FROM teams WHERE name = 'Support Team'),
  (SELECT id FROM users WHERE username = 'qa.staff4'),
  (SELECT id FROM users WHERE username = 'qa.manager2'), NOW() - INTERVAL '20 days', NOW(), NOW()),

('QA_TEST_Live chat integration', 'Implement live chat support feature', 'IN_REVIEW', 'HIGH',
  (SELECT id FROM projects WHERE name = 'Customer Portal'),
  (SELECT id FROM teams WHERE name = 'Support Team'),
  (SELECT id FROM users WHERE username = 'qa.staff5'),
  (SELECT id FROM users WHERE username = 'qa.lead2'), NOW() + INTERVAL '2 days', NOW(), NOW()),

('QA_TEST_Knowledge base setup', 'Create FAQ and knowledge base articles', 'TESTING', 'MEDIUM',
  (SELECT id FROM projects WHERE name = 'Customer Portal'),
  (SELECT id FROM teams WHERE name = 'Support Team'),
  (SELECT id FROM users WHERE username = 'qa.staff6'),
  (SELECT id FROM users WHERE username = 'qa.lead2'), NOW() + INTERVAL '5 days', NOW(), NOW());

-- Security Team Tasks
INSERT INTO tasks (title, description, status, priority, project_id, team_id, assigned_to_id, created_by_id, due_date, created_at, updated_at)
VALUES
('QA_TEST_Security audit report', 'Complete quarterly security audit', 'COMPLETED', 'HIGH',
  (SELECT id FROM projects WHERE name = 'Inventory Management System'),
  (SELECT id FROM teams WHERE name = 'Security Team'),
  (SELECT id FROM users WHERE username = 'qa.staff7'),
  (SELECT id FROM users WHERE username = 'qa.manager3'), NOW() - INTERVAL '10 days', NOW(), NOW()),

('QA_TEST_Implement 2FA authentication', 'Add two-factor authentication to all logins', 'IN_PROGRESS', 'HIGH',
  (SELECT id FROM projects WHERE name = 'Inventory Management System'),
  (SELECT id FROM teams WHERE name = 'Security Team'),
  (SELECT id FROM users WHERE username = 'qa.staff8'),
  (SELECT id FROM users WHERE username = 'qa.lead3'), NOW() + INTERVAL '7 days', NOW(), NOW()),

('QA_TEST_Overdue: Vulnerability scan - OVERDUE', 'Run automated vulnerability scanning', 'TODO', 'CRITICAL',
  (SELECT id FROM projects WHERE name = 'Inventory Management System'),
  (SELECT id FROM teams WHERE name = 'Security Team'),
  (SELECT id FROM users WHERE username = 'qa.staff7'),
  (SELECT id FROM users WHERE username = 'qa.manager3'), NOW() - INTERVAL '3 days', NOW() - INTERVAL '8 days', NOW());

-- Database Team Tasks
INSERT INTO tasks (title, description, status, priority, project_id, team_id, assigned_to_id, created_by_id, due_date, created_at, updated_at)
VALUES
('QA_TEST_Schema migration planning', 'Plan database schema migration steps', 'COMPLETED', 'HIGH',
  (SELECT id FROM projects WHERE name = 'Database Migration'),
  (SELECT id FROM teams WHERE name = 'Database Team'),
  (SELECT id FROM users WHERE username = 'qa.lead4'),
  (SELECT id FROM users WHERE username = 'qa.manager1'), NOW() - INTERVAL '25 days', NOW(), NOW()),

('QA_TEST_Data validation scripts', 'Create scripts to validate migrated data', 'IN_PROGRESS', 'HIGH',
  (SELECT id FROM projects WHERE name = 'Database Migration'),
  (SELECT id FROM teams WHERE name = 'Database Team'),
  (SELECT id FROM users WHERE username = 'qa.lead4'),
  (SELECT id FROM users WHERE username = 'qa.manager1'), NOW() + INTERVAL '4 days', NOW(), NOW()),

('QA_TEST_Performance testing', 'Test database performance after migration', 'TODO', 'MEDIUM',
  (SELECT id FROM projects WHERE name = 'Database Migration'),
  (SELECT id FROM teams WHERE name = 'Database Team'),
  (SELECT id FROM users WHERE username = 'qa.lead4'),
  (SELECT id FROM users WHERE username = 'qa.lead4'), NOW() + INTERVAL '14 days', NOW(), NOW());

-- Shipment Tracker Tasks
INSERT INTO tasks (title, description, status, priority, project_id, team_id, assigned_to_id, created_by_id, due_date, created_at, updated_at)
VALUES
('QA_TEST_Shipment tracking API', 'Develop shipment tracking REST API', 'IN_PROGRESS', 'HIGH',
  (SELECT id FROM projects WHERE name = 'Shipment Tracker'),
  (SELECT id FROM teams WHERE name = 'Frontend Team'),
  (SELECT id FROM users WHERE username = 'mike.staff'),
  (SELECT id FROM users WHERE username = 'admin'), NOW() + INTERVAL '5 days', NOW(), NOW()),

('QA_TEST_SMS notification service', 'Integrate SMS notification for shipment updates', 'TODO', 'MEDIUM',
  (SELECT id FROM projects WHERE name = 'Shipment Tracker'),
  (SELECT id FROM teams WHERE name = 'Frontend Team'),
  (SELECT id FROM users WHERE username = 'alex.staff'),
  (SELECT id FROM users WHERE username = 'admin'), NOW() + INTERVAL '12 days', NOW(), NOW());

-- ============================================
-- CHECKLISTS - Realistic shift checklists
-- ============================================
-- Logistics Team Morning Shift Checklist
INSERT INTO checklists (title, description, shift_id, team_id, created_by_id, created_at, updated_at)
SELECT 'QA_Morning Shift Checklist - Logistics', 'Daily opening tasks for logistics team',
  (SELECT id FROM shifts WHERE shift_type = 'MORNING'),
  (SELECT id FROM teams WHERE name = 'Logistics Team'),
  (SELECT id FROM users WHERE username = 'qa.lead1'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM checklists WHERE title = 'QA_Morning Shift Checklist - Logistics');

-- Logistics Team Evening Shift Checklist
INSERT INTO checklists (title, description, shift_id, team_id, created_by_id, created_at, updated_at)
SELECT 'QA_Evening Shift Checklist - Logistics', 'Daily closing tasks for logistics team',
  (SELECT id FROM shifts WHERE shift_type = 'EVENING'),
  (SELECT id FROM teams WHERE name = 'Logistics Team'),
  (SELECT id FROM users WHERE username = 'qa.lead1'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM checklists WHERE title = 'QA_Evening Shift Checklist - Logistics');

-- Support Team Morning Shift Checklist
INSERT INTO checklists (title, description, shift_id, team_id, created_by_id, created_at, updated_at)
SELECT 'QA_Morning Shift Checklist - Support', 'Daily opening tasks for support team',
  (SELECT id FROM shifts WHERE shift_type = 'MORNING'),
  (SELECT id FROM teams WHERE name = 'Support Team'),
  (SELECT id FROM users WHERE username = 'qa.lead2'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM checklists WHERE title = 'QA_Morning Shift Checklist - Support');

-- Security Team Night Shift Checklist
INSERT INTO checklists (title, description, shift_id, team_id, created_by_id, created_at, updated_at)
SELECT 'QA_Night Shift Checklist - Security', 'Night security monitoring tasks',
  (SELECT id FROM shifts WHERE shift_type = 'NIGHT'),
  (SELECT id FROM teams WHERE name = 'Security Team'),
  (SELECT id FROM users WHERE username = 'qa.lead3'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM checklists WHERE title = 'QA_Night Shift Checklist - Security');

-- Database Team Checklist
INSERT INTO checklists (title, description, shift_id, team_id, created_by_id, created_at, updated_at)
SELECT 'QA_Database Migration Checklist', 'Daily migration progress checklist',
  (SELECT id FROM shifts WHERE shift_type = 'MORNING'),
  (SELECT id FROM teams WHERE name = 'Database Team'),
  (SELECT id FROM users WHERE username = 'qa.lead4'), NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM checklists WHERE title = 'QA_Database Migration Checklist');

-- ============================================
-- CHECKLIST ITEMS
-- ============================================
-- Logistics Morning Checklist Items
INSERT INTO checklist_items (title, description, completed, checklist_id, assigned_to_id, created_at, updated_at)
VALUES
('QA_Check delivery vehicles', 'Verify all delivery vehicles are ready', false,
  (SELECT id FROM checklists WHERE title = 'QA_Morning Shift Checklist - Logistics'),
  (SELECT id FROM users WHERE username = 'qa.staff1'), NOW(), NOW()),

('QA_Review pending deliveries', 'Check and assign pending delivery routes', false,
  (SELECT id FROM checklists WHERE title = 'QA_Morning Shift Checklist - Logistics'),
  (SELECT id FROM users WHERE username = 'qa.staff2'), NOW(), NOW()),

('QA_Update driver schedules', 'Sync driver schedules with dispatch system', true,
  (SELECT id FROM checklists WHERE title = 'QA_Morning Shift Checklist - Logistics'),
  (SELECT id FROM users WHERE username = 'qa.lead1'), NOW(), NOW()),

('QA_Fuel verification', 'Check fuel levels in all vehicles', false,
  (SELECT id FROM checklists WHERE title = 'QA_Morning Shift Checklist - Logistics'),
  (SELECT id FROM users WHERE username = 'qa.staff3'), NOW(), NOW());

-- Logistics Evening Checklist Items
INSERT INTO checklist_items (title, description, completed, checklist_id, assigned_to_id, created_at, updated_at)
VALUES
('QA_Complete end-of-day reports', 'Generate and submit daily delivery reports', false,
  (SELECT id FROM checklists WHERE title = 'QA_Evening Shift Checklist - Logistics'),
  (SELECT id FROM users WHERE username = 'qa.staff1'), NOW(), NOW()),

('QA_Vehicle return verification', 'Confirm all vehicles returned to depot', true,
  (SELECT id FROM checklists WHERE title = 'QA_Evening Shift Checklist - Logistics'),
  (SELECT id FROM users WHERE username = 'qa.staff2'), NOW(), NOW()),

('QA_Update tomorrow schedule', 'Prepare delivery schedule for next day', false,
  (SELECT id FROM checklists WHERE title = 'QA_Evening Shift Checklist - Logistics'),
  (SELECT id FROM users WHERE username = 'qa.lead1'), NOW(), NOW());

-- Support Morning Checklist Items
INSERT INTO checklist_items (title, description, completed, checklist_id, assigned_to_id, created_at, updated_at)
VALUES
('QA_Check ticket queue', 'Review pending support tickets', false,
  (SELECT id FROM checklists WHERE title = 'QA_Morning Shift Checklist - Support'),
  (SELECT id FROM users WHERE username = 'qa.staff4'), NOW(), NOW()),

('QA_Update FAQ knowledge base', 'Add new common questions to FAQ', true,
  (SELECT id FROM checklists WHERE title = 'QA_Morning Shift Checklist - Support'),
  (SELECT id FROM users WHERE username = 'qa.staff5'), NOW(), NOW()),

('QA_Team briefing', 'Conduct morning team standup', true,
  (SELECT id FROM checklists WHERE title = 'QA_Morning Shift Checklist - Support'),
  (SELECT id FROM users WHERE username = 'qa.lead2'), NOW(), NOW());

-- Security Night Checklist Items
INSERT INTO checklist_items (title, description, completed, checklist_id, assigned_to_id, created_at, updated_at)
VALUES
('QA_Perimeter check', 'Complete security perimeter patrol', false,
  (SELECT id FROM checklists WHERE title = 'QA_Night Shift Checklist - Security'),
  (SELECT id FROM users WHERE username = 'qa.staff7'), NOW(), NOW()),

('QA_Camera surveillance review', 'Review all camera feeds for anomalies', false,
  (SELECT id FROM checklists WHERE title = 'QA_Night Shift Checklist - Security'),
  (SELECT id FROM users WHERE username = 'qa.staff8'), NOW(), NOW()),

('QA_Access log review', 'Check and verify all access log entries', true,
  (SELECT id FROM checklists WHERE title = 'QA_Night Shift Checklist - Security'),
  (SELECT id FROM users WHERE username = 'qa.lead3'), NOW(), NOW()),

('QA_Emergency response check', 'Verify emergency protocols are accessible', false,
  (SELECT id FROM checklists WHERE title = 'QA_Night Shift Checklist - Security'),
  (SELECT id FROM users WHERE username = 'qa.staff7'), NOW(), NOW());

-- Database Migration Checklist Items
INSERT INTO checklist_items (title, description, completed, checklist_id, assigned_to_id, created_at, updated_at)
VALUES
('QA_Backup verification', 'Verify last backup completed successfully', true,
  (SELECT id FROM checklists WHERE title = 'QA_Database Migration Checklist'),
  (SELECT id FROM users WHERE username = 'qa.lead4'), NOW(), NOW()),

('QA_Migration progress check', 'Review current migration status', false,
  (SELECT id FROM checklists WHERE title = 'QA_Database Migration Checklist'),
  (SELECT id FROM users WHERE username = 'qa.lead4'), NOW(), NOW()),

('QA_Error log review', 'Check for any migration errors', false,
  (SELECT id FROM checklists WHERE title = 'QA_Database Migration Checklist'),
  (SELECT id FROM users WHERE username = 'qa.lead4'), NOW(), NOW());

-- ============================================
-- NOTES - Test notes functionality
-- ============================================
INSERT INTO notes (content, task_id, created_by_id, created_at, updated_at)
SELECT 'QA_TEST_Note: This task is waiting for API documentation', 
  (SELECT id FROM tasks WHERE title LIKE 'QA_TEST_Integrate GPS tracking API' LIMIT 1),
  (SELECT id FROM users WHERE username = 'qa.lead1'), NOW(), NOW();

INSERT INTO notes (content, task_id, created_by_id, created_at, updated_at)
SELECT 'QA_TEST_Note: Blocked due to vendor dependency - waiting for their API',
  (SELECT id FROM tasks WHERE title LIKE 'QA_TEST_Overdue: Driver assignment module' LIMIT 1),
  (SELECT id FROM users WHERE username = 'qa.staff1'), NOW(), NOW();

INSERT INTO notes (content, task_id, created_by_id, created_at, updated_at)
SELECT 'QA_TEST_Note: Review pending - need more testing',
  (SELECT id FROM tasks WHERE title LIKE 'QA_TEST_Live chat integration' LIMIT 1),
  (SELECT id FROM users WHERE username = 'qa.manager2'), NOW(), NOW();

-- ============================================
-- HANDOVERS - Test handover functionality
-- ============================================
INSERT INTO handovers (title, completed_work, pending_work, blockers, next_shift_instructions,
  from_shift_id, to_shift_id, assigned_team_id, receiving_team_id,
  created_by_id, resolved, acknowledged, acknowledged_at, priority, created_at, updated_at)
VALUES
('QA_Morning to Evening Handover - Logistics',
  'Processed 45 deliveries, completed vehicle maintenance',
  'Evening team to complete remaining 20 deliveries',
  'Weather delay affecting route 5 - may need adjustment',
  'Check route 5 status and adjust if needed. Fuel reserves low - coordinate with night shift.',
  (SELECT id FROM shifts WHERE shift_type = 'MORNING'),
  (SELECT id FROM shifts WHERE shift_type = 'EVENING'),
  (SELECT id FROM teams WHERE name = 'Logistics Team'),
  (SELECT id FROM teams WHERE name = 'Logistics Team'),
  (SELECT id FROM users WHERE username = 'qa.lead1'), false, false, NULL, 'HIGH', NOW(), NOW()),

('QA_Evening to Night Handover - Security',
  'Completed 8 perimeter patrols, all clear',
  'Night shift to monitor cameras, check entry points',
  NULL,
  'All systems normal. Check east gate lock mechanism - reported as faulty.',
  (SELECT id FROM shifts WHERE shift_type = 'EVENING'),
  (SELECT id FROM shifts WHERE shift_type = 'NIGHT'),
  (SELECT id FROM teams WHERE name = 'Security Team'),
  (SELECT id FROM teams WHERE name = 'Security Team'),
  (SELECT id FROM users WHERE username = 'qa.lead3'), false, false, NULL, 'MEDIUM', NOW(), NOW());

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
SELECT 'QA Test Data Loaded Successfully!' AS status;

SELECT COUNT(*) || ' total users' FROM users;
SELECT COUNT(*) || ' managers' FROM users WHERE role = 'MANAGER';
SELECT COUNT(*) || ' team leads' FROM users WHERE role = 'TEAM_LEAD';
SELECT COUNT(*) || ' staff' FROM users WHERE role = 'STAFF';
SELECT COUNT(*) || ' projects' FROM projects;
SELECT COUNT(*) || ' teams' FROM teams;
SELECT COUNT(*) || ' tasks' FROM tasks WHERE title LIKE 'QA_TEST%';
SELECT COUNT(*) || ' checklists' FROM checklists WHERE title LIKE 'QA_%';
SELECT COUNT(*) || ' checklist items' FROM checklist_items WHERE title LIKE 'QA_%';
SELECT COUNT(*) || ' handovers' FROM handovers WHERE title LIKE 'QA_%';
SELECT COUNT(*) || ' notes' FROM notes WHERE content LIKE 'QA_TEST%';