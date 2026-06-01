# Store Task & Checklist Manager — Presentation Content (Condensed: 11 Slides)

---

## SLIDE 1 — Title & Problem Statement

**Title:** Store Task & Checklist Manager  
**Subtitle:** Internal Workflow Management System | Internship Project

**Problem Statement:**
- Retail teams relied on manual communication (whiteboards, paper notes, spreadsheets) for shift coordination
- No centralized system to track tasks across Morning/Evening/Night shifts
- Shift handovers often missed critical information — pending work, blockers, instructions
- Managers lacked real-time visibility into team progress, overdue tasks, and checklist compliance

**Suggested Visual:** Left half — app logo + title; Right half — split graphic showing "Paper/Whiteboard" (old) → arrow → "Dashboard screenshot" (new)

**Presenter Notes:**
> Before this system, the store operated on paper checklists and verbal handovers, leading to information gaps between shifts. This project digitizes those workflows into a centralized web platform.

---

## SLIDE 2 — Objective & Comparison

**Title:** Objective & System Comparison

**Objective:**
- Build a centralized web platform for task, checklist, and shift management
- Role-based access for 6 user roles (Super Admin → Staff)
- Real-time dashboards with role-scoped statistics
- Structured shift handovers with Resolve/Acknowledge workflow
- Full audit logging for accountability

**Comparison:**

| Parameter | Existing | Proposed |
|-----------|----------|----------|
| Task tracking | Whiteboards | Digital CRUD + status workflow |
| Shift handovers | Verbal/Paper | Structured forms + acknowledgment |
| Checklists | Paper printouts | Digital with item-level completion |
| Visibility | None | Real-time dashboards |
| Audit trail | None | Complete action logs |
| Access control | None | 6-role hierarchy |

**Suggested Visual:** Table format with green checkmarks on Proposed side

**Presenter Notes:**
> The objective was to replace all manual processes with a digital system. The table shows the key improvements across 6 dimensions.

---

## SLIDE 3 — Tech Stack

**Title:** Technology Stack

| Layer | Technologies |
|-------|-------------|
| **Backend** | Java 17, Spring Boot 3.2, Spring Security (JWT), Spring Data JPA / Hibernate |
| **Database** | PostgreSQL |
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6 |
| **HTTP Client** | Axios (with JWT interceptor) |
| **Build Tools** | Maven, npm |
| **Dev Proxy** | Vite proxy → `localhost:8080` (solves CORS) |

**Suggested Visual:** Logo banner row — Java → Spring Boot → PostgreSQL → React → Vite → Tailwind CSS

**Presenter Notes:**
> The backend uses Java 17 with Spring Boot 3.2 — a modern, production-grade stack. Frontend is React 18 with Vite for fast builds. All styled with Tailwind CSS for consistent UI.

---

## SLIDE 4 — System Architecture

**Title:** System Architecture

```
Browser ──► React 18 ──► Axios (JWT) ──► Spring Boot 3.2 ──► PostgreSQL
              │                                │
         Vite Proxy (:5173→:8080)      Controllers → Services → Repositories
```

**Key Design Decisions:**
- Stateless JWT authentication (no server-side sessions)
- Layered architecture: Controller → Service → Repository
- `AssignmentValidator.java` enforces role-based assignment rules at service layer
- Global exception handler (`@RestControllerAdvice`) returns structured JSON errors
- `DataInitializer` generates public IDs (USR-xxx, TEAM-xxx, PRJ-xxx) on startup

**Suggested Visual:** Simple 3-layer block diagram — Browser → Frontend → Backend → Database with arrows

**Presenter Notes:**
> The architecture follows a standard 3-tier model. The key design choice was stateless JWT authentication, which means no server-side session management. The Vite proxy handles CORS during development.

---

## SLIDE 5 — Module Breakdown

**Title:** Module Breakdown (11 Modules)

| Module | Key Features |
|--------|-------------|
| **Authentication** | JWT login, password change, first-login enforcement |
| **User Management** | CRUD, role assignment, team/shift mapping |
| **Project Management** | CRUD with status (Active/On Hold/Completed) |
| **Team Management** | CRUD with manager + team lead + member assignment (max 3 teams per manager) |
| **Task Management** | 6 statuses (TODO→COMPLETED|BLOCKED), 3 priorities, notes, checklists |
| **Checklist Management** | Shift-specific checklists, item-level assignment, progress bar |
| **Shift Management** | Morning/Evening/Night shift definitions |
| **Shift Handover** | Structured handover with Resolve/Acknowledge lifecycle |
| **Dashboard** | 8 stat cards + recent tasks + pending items (role-scoped) |
| **Audit Logging** | Action tracking with user, entity, old/new values |
| **Notes** | Per-task notes with create and delete |

**Suggested Visual:** 3×4 grid of module cards with icons and brief descriptions

**Presenter Notes:**
> 11 modules are fully implemented. Each follows a consistent CRUD pattern with server-side validation and audit logging built in.

---

## SLIDE 6 — Authentication, Authorization & Role Hierarchy

**Title:** Authentication & Role-Based Access

**Authentication Flow:**
```
Login → Server validates → JWT issued → Stored in localStorage
→ Axios interceptor attaches "Bearer <token>" to all requests
→ 401 response → Auto-redirect to /login
```

**Role Hierarchy (6 roles):**

```
SUPER_ADMIN  → Full system access
    │
MANAGER      → Manage teams/projects/users; oversee multiple teams
    │
TEAM_LEAD    → Manage team tasks; assign to staff
    │
DEVELOPER    → Technical staff (STAFF-level permissions)
TESTER       → QA staff (STAFF-level permissions)
STAFF        → View own tasks, complete checklist items
```

**Assignment Rules (AssignmentValidator.java):**
- SUPER_ADMIN: assign to anyone except self
- MANAGER: assign to TEAM_LEAD/STAFF within managed teams only
- TEAM_LEAD: assign to STAFF only within own team
- STAFF level: assign only to other staff within own team

**Navigation Visibility:**
- Users / Audit Logs: MANAGER+ only
- Shifts: Hidden for TEAM_LEAD
- Create/Edit/Delete: MANAGER+ for most resources

**Suggested Visual:** Pyramid diagram with SUPER_ADMIN at top → STAFF at bottom + smaller flow diagram for auth

**Presenter Notes:**
> The role hierarchy is strictly enforced on both frontend and backend. The AssignmentValidator prevents any user from bypassing the hierarchy through direct API calls.

---

## SLIDE 7 — Dashboard & Task Management

**Title:** Dashboard & Task Management

**Dashboard Features:**
- 8 stat cards: Total Tasks, Pending, Completed, Overdue, Projects, Teams, Pending Checklist Items, Delayed Checklists
- Recent Tasks panel (last 10 updated)
- Pending Checklist Items panel
- **Role-scoped data:** SUPER_ADMIN sees all, MANAGER sees managed teams, TEAM_LEAD sees own team, STAFF sees own tasks

**Task Management:**
- 6 statuses: **TODO** → **IN_PROGRESS** → **IN_REVIEW** → **TESTING** → **COMPLETED** | **BLOCKED**
- 3 priorities: LOW, MEDIUM, HIGH (color-coded badges)
- Assignment to team members with role validation
- Due date tracking with overdue detection
- Per-task notes
- Per-task checklists with progress percentage
- Separate Active Tasks / Completed Tasks views
- Creation restricted to SUPER_ADMIN, MANAGER, TEAM_LEAD

**Status Colors:** Blue (TODO), Yellow (In Progress), Purple (In Review), Orange (Testing), Green (Completed), Red (Blocked)

**Suggested Visual:** Screenshot of Dashboard (stat cards) on left + Tasks page (table with status badges) on right

**Presenter Notes:**
> The Dashboard gives instant visibility. Tasks flow through 6 statuses with clear color coding. The system tracks overdue tasks and shows completion progress through integrated checklists.

---

## SLIDE 8 — Checklist Management & Shift Handover

**Title:** Checklists & Shift Handovers

**Checklist Management:**
- Full CRUD with item-level assignment to team members
- Shift-specific checklists (Morning: opening tasks / Evening: closing / Night: security)
- Checkbox completion with uncomplete option
- Progress percentage bar per checklist
- All roles can create checklists; only SUPER_ADMIN/MANAGER can delete
- Items cannot be self-assigned

**Shift Handover System:**
- 5 structured fields: Completed Work, Pending Work, Blockers, Next Shift Instructions, Priority
- From-Shift → To-Shift selection (Morning → Evening → Night → Morning)
- Cross-team handovers (assigned team → receiving team)
- **Lifecycle:** Pending → Resolved (by incoming team) → Acknowledged (by outgoing team)
- 4 priority levels: LOW, MEDIUM, HIGH, CRITICAL
- Detail view modal for each handover

**Suggested Visual:** Left — Checklist card with progress bar + items + checkboxes. Right — Handover card showing Pending/Resolved badges + action buttons

**Presenter Notes:**
> Checklists ensure shift-specific tasks are completed. The handover module is the most unique feature — the resolve/acknowledge cycle creates a formal handoff that ensures no information is lost between shifts.

---

## SLIDE 9 — Team/Project Management & Audit Logging

**Title:** Teams, Projects & Audit Logging

**Project Management:**
- CRUD with 4 statuses: ACTIVE, ON_HOLD, PLANNING, COMPLETED
- Date range validation (start ≥ end)
- Clickable cards → Project Details → Team Workspace → Task Details

**Team Management:**
- CRUD with manager + team lead + multi-member assignment
- Constraints: max 3 teams per manager, 1 team per lead, 1 team per member
- Member selection via checkbox list with role labels
- Team workspace page with project context + task table

**Audit Logging:**
- Every action logged: LOGIN, LOGOUT, PASSWORD_CHANGE, USER_CREATED, TASK_*, etc.
- Stores: action name, entity type, entity ID, old/new values, performed by, timestamp
- Role-scoped visibility:
  - SUPER_ADMIN: all logs
  - MANAGER: managed team logs
  - TEAM_LEAD: own team logs
  - STAFF: non-admin logs only

**Suggested Visual:** Top — Project cards grid. Bottom — Audit Log table with colored role badges

**Presenter Notes:**
> Teams are the organizational unit. The audit log provides full traceability for compliance and accountability.

---

## SLIDE 10 — Database Design & API Structure

**Title:** Database Design & API Overview

**Database (PostgreSQL — 11 tables):**

| Table | Key Relations |
|-------|--------------|
| `users` | → teams, shifts |
| `teams` | → projects, users (manager/lead) |
| `projects` | → teams, tasks |
| `shifts` | → teams |
| `tasks` | → projects, teams, users (assigned/created) |
| `checklists` | → shifts, teams, tasks, users |
| `checklist_items` | → checklists, users (assigned/completed) |
| `handovers` | → shifts (from/to), teams (assigned/receiving), users |
| `notes` | → tasks, users |
| `audit_logs` | → users |
| `handover_notes` | → handovers |

**API Structure (50+ endpoints):**
- Auth: login, change-password, create-user, me, logout
- Resources: `/api/{users|teams|projects|tasks|shifts|checklists|handovers}` with full CRUD
- Specialized: `/my-tasks`, `/overdue`, `/by-team/{id}`, `/by-project/{id}`, `/complete`, `/resolve`, `/acknowledge`
- Dashboard: `GET /api/dashboard`
- Audit: `GET /api/audit-logs` + `/recent` + `/by-user/{id}`

**Suggested Visual:** Left — simplified ERD showing table relationships. Right — API endpoint list grouped by resource

**Presenter Notes:**
> The database has 11 normalized tables with the most complex being Handover (connected to 2 shifts and 2 teams). The API follows RESTful conventions with 50+ endpoints.

---

## SLIDE 11 — Challenges, Limitations, Future Scope & Conclusion

**Title:** Key Takeaways & Road Ahead

**Challenges Solved:**
| Challenge | Solution |
|-----------|----------|
| Role-based assignment validation | `AssignmentValidator.java` — explicit hierarchy checks for all role combinations |
| Preventing circular team membership | Uniqueness checks + `syncUserTeamRelationships` |
| JWT security | HMAC-SHA256 with 256-bit key |
| Audit log role-filtering | Separate query methods per role |
| Frontend data scoping | Role-aware filter functions in every page |

**Current Limitations:**
- No real-time notifications (WebSocket)
- No email/SMS alerts
- No file attachments
- No mobile-responsive sidebar
- No pagination for large datasets
- No unit/integration tests

**Future Enhancements:**
- **High:** WebSocket notifications, email/SMS alerts, file attachments
- **Medium:** Mobile responsive, pagination, unit tests, Excel/PDF export
- **Low:** Dark mode, calendar view, performance charts

**Conclusion:**
- 11 integrated modules built with Java 17 + Spring Boot 3.2 + React 18 + PostgreSQL
- Secure JWT auth with 6-role hierarchy enforced at every layer
- 50+ REST APIs with comprehensive validation and error handling
- Real-world workflow design: tasks, checklists, shift handovers, audit logging

**Suggested Visual:** Left column — 3 icons (Challenge, Limitation, Future). Right column — Conclusion with key metrics: "11 Modules" / "50+ APIs" / "6 Roles" / "11 Tables"

**Presenter Notes:**
> This project demonstrates end-to-end full-stack development — from database design to React UI, with a strong focus on security and real-world operational workflows. The roadmap focuses on real-time and reporting capabilities. Thank you for your attention — I'm happy to take questions.

---

## APPENDIX — Presentation Guidelines

**Color Theme:** Primary `#2563EB` (Blue-600), Sidebar `#111827` (Gray-900), Success `#059669`, Danger `#DC2626`, Background `#F3F4F6`

**Recommended Transitions:** Fade or Push (slide), Appear one-by-one (bullets)

**Where to Take Screenshots:**
| Slide | Screenshot |
|-------|-----------|
| 1 (Title) | Dashboard — full layout |
| 7 (Dashboard) | Dashboard — stat cards + panels |
| 7 (Tasks) | Tasks page — active tasks table |
| 8 (Checklists) | Checklists page — card with items |
| 8 (Handovers) | Handovers page — card with resolve button |
| 9 (Teams) | Teams page — card grid |
| 9 (Audit) | Audit Logs page — log entries |

**PPT Dimensions:** 16:9 widescreen (1920×1080)

---

*End of Presentation Content (11 Slides)*
