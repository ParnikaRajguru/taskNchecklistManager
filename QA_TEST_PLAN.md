# QA TEST PLAN - Task & Checklist Manager

## PHASE 1: DUMMY DATA CREATION
- [x] Created qa-test-data.sql with:
  - 3 additional Managers (qa.manager1, qa.manager2, qa.manager3)
  - 4 additional Team Leads (qa.lead1-4)
  - 8 Staff users (qa.staff1-8)
  - 6 new Projects
  - 4 new Teams
  - 15+ Tasks with various statuses (COMPLETED, IN_PROGRESS, TODO, BLOCKED, OVERDUE)
  - 5 Checklists with 20+ items
  - 2 Handovers
  - Test Notes

## PHASE 2: ROLE TESTING CHECKLIST

### SUPER_ADMIN (admin)
- [ ] Login as admin
- [ ] View Dashboard - verify sees ALL data
- [ ] Access Users page - verify sees ALL users
- [ ] Create new user with any role
- [ ] Edit any user
- [ ] Delete any user
- [ ] Create/Edit/Delete any project
- [ ] Create/Edit/Delete any team
- [ ] Assign users to any team
- [ ] Create tasks for any team
- [ ] View all audit logs
- [ ] Verify no permission restrictions

### MANAGER (qa.manager1)
- [ ] Login as manager
- [ ] View Dashboard - verify only sees own teams
- [ ] Access Users page - verify only sees own team members
- [ ] Create new user (STAFF/TEAM_LEAD only)
- [ ] Cannot create admin or manager
- [ ] Edit own team members only
- [ ] Cannot edit other managers or admin
- [ ] Create projects
- [ ] Create teams (assign self as manager)
- [ ] Cannot assign self as team lead
- [ ] Cannot assign other managers
- [ ] Create tasks for own team
- [ ] Cannot assign tasks to admin or other managers

### TEAM_LEAD (qa.lead1)
- [ ] Login as team lead
- [ ] View Dashboard - verify sees only own team
- [ ] Access Users page - verify sees only team members
- [ ] Cannot create users
- [ ] Edit team members (STAFF only)
- [ ] Cannot edit managers or other leads
- [ ] Create tasks for own team only
- [ ] Cannot assign to manager/admin/other leads
- [ ] Can assign to same team STAFF only

### STAFF (qa.staff1)
- [ ] Login as staff
- [ ] View Dashboard - verify sees only own tasks
- [ ] Cannot access Users page fully
- [ ] View own profile only
- [ ] Cannot create users
- [ ] Cannot edit other users
- [ ] Can view tasks assigned to self
- [ ] Cannot create tasks (verify no create button)
- [ ] Can complete checklist items
- [ ] Cannot delete checklists

## PHASE 3: MODULE TESTING

### Authentication
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Password change on first login
- [ ] Session timeout handling
- [ ] JWT token expiration

### Dashboard
- [ ] Task counts accurate
- [ ] Project counts accurate
- [ ] Team counts accurate
- [ ] Overdue tasks count
- [ ] Pending checklist items
- [ ] Role-based filtering works

### Users Module
- [ ] Create user with all roles
- [ ] Edit user details
- [ ] Change user role
- [ ] Assign user to team
- [ ] Reset user password
- [ ] Delete user
- [ ] User list filtering by role

### Teams Module
- [ ] Create team
- [ ] Assign manager to team
- [ ] Assign team lead to team
- [ ] Add members to team
- [ ] Remove members from team
- [ ] Edit team
- [ ] Delete team (with tasks/checklists)

### Projects Module
- [ ] Create project
- [ ] Edit project
- [ ] Delete project (with teams/tasks)
- [ ] Filter by status
- [ ] View project details

### Tasks Module
- [ ] Create task (all roles except STAFF)
- [ ] Edit task
- [ ] Change task status
- [ ] Change task priority
- [ ] Assign to user
- [ ] Assign to team
- [ ] Set due date
- [ ] Delete task
- [ ] View task notes

### Checklists Module
- [ ] Create checklist
- [ ] Add checklist items
- [ ] Assign items to users
- [ ] Complete/uncomplete items
- [ ] Edit checklist
- [ ] Delete checklist (manager+ only)
- [ ] View progress percentage

### Handovers Module
- [ ] Create handover
- [ ] View pending handovers
- [ ] Resolve handover
- [ ] Acknowledge handover
- [ ] Delete handover

### Notes Module
- [ ] Add note to task
- [ ] View notes on task
- [ ] Edit note (own notes only)
- [ ] Delete note (own notes only)
- [ ] Admin can delete any note

### Audit Logs
- [ ] View all logs (admin/manager)
- [ ] Filter by user
- [ ] Filter by action type
- [ ] Verify all actions logged

## PHASE 4: EDGE CASES

### Invalid Assignments
- [ ] Self assignment (should fail)
- [ ] Manager assigning to other manager
- [ ] Team lead assigning to other lead
- [ ] Staff assigning to higher role
- [ ] Cross-team assignment (should fail)

### Data Integrity
- [ ] Delete team with tasks
- [ ] Delete project with teams
- [ ] Delete user with assigned tasks
- [ ] Null foreign key handling

### Validation
- [ ] Empty required fields
- [ ] Invalid date ranges
- [ ] Duplicate usernames
- [ ] Invalid email format

## PHASE 5: BUG FIXES

## PHASE 6: FINAL QA REPORT