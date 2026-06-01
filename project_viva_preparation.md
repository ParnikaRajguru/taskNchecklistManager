# Project Deep Analysis & Viva Preparation Document
**Project:** Store Task & Checklist Manager

---

# 1. Project Overview

**Problem Statement:**
Managing day-to-day operations, task delegations, and shift handovers in a retail store or enterprise environment often relies on fragmented communication (WhatsApp, verbal handovers, paper checklists). This leads to lost information, lack of accountability, missed tasks during shift changes, and poor progress tracking.

**Why it was built:**
To provide a centralized, Jira-like workflow management system tailored for internal team operations. It digitizes operations, ensuring every task is tracked, every shift handover is documented, and role-based access restricts sensitive actions to authorized personnel.

**Target Users:**
Store Managers, Team Leads, Shift Supervisors, and Staff members across different departments (Frontend, Backend, QA, Inventory, etc.).

**Main Functionalities:**
- **Role-Based Access Control (RBAC):** Super Admin, Manager, Team Lead, Staff with distinct permissions.
- **Task Management:** Creation, assignment, status tracking (TODO, IN_PROGRESS, DONE), and priority setting.
- **Checklist Workflow:** Granular sub-task tracking.
- **Shift Management & Handovers:** Ensuring seamless transition between Morning, Evening, and Night shifts with documented handover notes.
- **Audit Logging:** System-wide tracking of critical actions (e.g., Task created, Task status updated) for accountability.
- **Team & Project Grouping:** Organizing staff into teams and mapping tasks to specific projects.

**Business Objective:**
To enhance operational efficiency, ensure 100% accountability through audit logs, minimize handover miscommunications, and provide management with real-time visibility into store/project status.

---

# 2. Technology Stack

### Frontend
- **React.js (Vite):** Chosen for fast development, hot module replacement, and efficient component-based UI rendering. Vite provides significantly faster build times compared to Create React App.
- **Tailwind CSS:** Used for utility-first styling. It allows rapid UI development without writing custom CSS, ensuring a consistent design system.
- **React Router DOM:** For Client-Side Routing (Single Page Application architecture) without page reloads.
- **Context API:** Used (`AuthContext.jsx`) for global state management of user authentication status. Chosen over Redux because the state complexity (auth token, user details) is low, avoiding Redux boilerplate.
- **Axios:** Promise-based HTTP client for making API requests. Used interceptors to automatically attach JWT tokens to every request.

### Backend
- **Spring Boot (3.2.0):** Java-based framework chosen for its rapid enterprise application development capabilities, built-in Tomcat server, and auto-configuration.
- **Spring Security:** For securing REST APIs, handling authentication, and method-level authorization (e.g., `@PreAuthorize`).
- **Spring Data JPA & Hibernate:** For Object-Relational Mapping (ORM). It eliminates boilerplate SQL and maps Java entities directly to PostgreSQL tables.
- **JWT (io.jsonwebtoken):** For stateless, secure authentication. It scales better than session-based auth because the server doesn't need to store session states in memory.
- **Lombok:** Reduces Java boilerplate code (getters, setters, constructors) using annotations like `@Data`, `@NoArgsConstructor`.

### Database
- **PostgreSQL:** Chosen for its robustness, ACID compliance, and excellent support for relational data structures (foreign keys, complex joins).

---

# 3. Complete System Architecture

## High Level Architecture

**User** 
↓ (HTTP/HTTPS Requests)
**React Frontend (Vite App)**
↓ (Axios Interceptor attaches JWT token)
**API Layer (Spring Controllers - `com.store.taskmanager.controller`)**
↓ (DTO Mapping & Validation)
**Service Layer (`com.store.taskmanager.service`)**
↓ (Business Logic & Rule Enforcement)
**Repository Layer (Spring Data JPA - `com.store.taskmanager.repository`)**
↓ (Hibernate / SQL Queries)
**PostgreSQL Database**

### Layer Details:
1. **Frontend Layer:** The user interacts with React components. When an action occurs (e.g., clicking "Login"), Axios sends an async request to the backend.
2. **Security Filter Chain:** The request hits `JwtAuthenticationFilter`. If a token exists, it is validated using `JwtTokenProvider`. Security context is established.
3. **Controller Layer:** Receives the request, validates input (`@Valid`), and routes it to the correct Service. Returns `ResponseEntity` (JSON).
4. **Service Layer:** Contains the core business logic. E.g., `TaskService.java` checks if a user has permission to update a task before calling the repository.
5. **Repository Layer:** Interfaces extending `JpaRepository`. Provides CRUD operations out-of-the-box.
6. **Database:** Stores persistent relational data.

---

# 4. Folder Structure Explanation

### Frontend (`frontend/src/`)
- **`components/`**: Reusable UI parts (`Layout.jsx`, `ProtectedRoute.jsx`). `Layout` contains the Sidebar and Navbar.
- **`context/`**: Contains `AuthContext.jsx`. Manages global state for user login status, token storage, and user profile data.
- **`pages/`**: Stateful components representing distinct routes (e.g., `Dashboard.jsx`, `Tasks.jsx`, `Login.jsx`).
- **`services/`**: Contains `api.js`. Centralizes all Axios configurations, interceptors, and API endpoint definitions.
- **`App.jsx`**: The root component defining all `React Router` routes and wrapping the app in `<AuthProvider>`.

### Backend (`backend/src/main/java/com/store/taskmanager/`)
- **`controller/`**: Exposes REST API endpoints (`@RestController`). Maps HTTP requests to Java methods.
- **`service/`**: Holds business logic (`@Service`). Decouples logic from controllers.
- **`repository/`**: Interfaces extending `JpaRepository` (`@Repository`). Handles DB interactions.
- **`entity/`**: Java classes mapped to DB tables using JPA annotations (`@Entity`, `@Table`). e.g., `User.java`, `Task.java`.
- **`dto/`**: Data Transfer Objects. Used to pass data between client and server without exposing internal DB Entity structures (prevents over-posting attacks and circular references).
- **`config/`**: Configuration classes (e.g., `SecurityConfig.java` for CORS and Filter Chains).
- **`security/`**: Contains `JwtTokenProvider`, `JwtAuthenticationFilter`, and `CustomUserDetailsService` for authentication mechanics.
- **`exception/`**: Global exception handler (`@ControllerAdvice`) to format error responses nicely instead of returning stack traces.

---

# 5. Authentication & Authorization

### Step-by-Step Flow: "What happens internally when the user clicks Login?"

**Frontend Flow:**
1. User enters username/password on `Login.jsx` and clicks submit.
2. `AuthContext.login()` is called, which invokes `authService.login(credentials)` from `api.js`.
3. Axios sends a `POST /api/auth/login` request.

**Backend Flow:**
4. Request hits `AuthController.login()`.
5. Calls `AuthService.login()`, which uses `AuthenticationManager` to authenticate credentials.
6. `AuthenticationManager` uses `CustomUserDetailsService` to fetch the `User` from the database.
7. `BCryptPasswordEncoder` compares the raw password with the hashed password in the DB.
8. If matched, `JwtTokenProvider.generateToken()` creates a JWT using the secret key.
9. Backend returns a `LoginResponse` containing the JWT string and user details.

**Frontend Finalization:**
10. `api.js` receives the response. `AuthContext` saves the token and user object to `localStorage`.
11. State updates, triggering a re-render.
12. `ProtectedRoute` component evaluates the auth state, sees the user is logged in, and allows rendering of `<Layout />`, redirecting the user to `/dashboard`.
13. Subsequent API calls: Axios Interceptor reads `localStorage.getItem('token')` and appends `Authorization: Bearer <token>` to the request headers.

**Authorization (Protected Routes / Method Security):**
- Frontend: `ProtectedRoute.jsx` checks if a user object exists. If not, redirects to `/login`.
- Backend: `SecurityConfig.java` mandates all endpoints except `/api/auth/**` require authentication. Methods are secured with `@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")` (e.g., `createUser` in `AuthController`).

---

# 6. Feature-by-Feature Deep Explanation

### User Registration (Create User)
- **Purpose:** Allow admins to onboard new employees. Self-registration is disabled for security.
- **Frontend Flow:** Admin navigates to `/users`, clicks "Add User", fills form, calls `api.post('/auth/create-user')`.
- **Backend Flow:** `AuthController.createUser` is protected by `@PreAuthorize`. Validates data, assigns default password, hashes it, saves to DB.
- **DB Flow:** Insert into `users` table.

### Task Management (Create, List, Update)
- **Purpose:** Core Jira-like feature to manage work items.
- **Backend Flow:** `TaskController` -> `TaskService`. Service maps DTO to Entity. Links `Project`, `Team`, `User` entities based on IDs.
- **Audit Logging Integration:** In `TaskService`, whenever a task is created or its status changes, a call to `AuditLogService.logAction(...)` is made to record the change.
- **DB Flow:** Inserts into `tasks` table. Updates trigger a new row in `audit_logs` table.

### Shift Handovers
- **Purpose:** Ensure seamless transitions. Staff creates a handover note at the end of their shift.
- **Frontend Flow:** User goes to Handovers -> Add Handover -> Selects Shift, writes notes, marks unresolved issues.
- **Backend Flow:** `HandoverService` saves the handover. Next shift users can call `/api/handovers/unacknowledged` to view pending handovers and PUT `/api/handovers/{id}/acknowledge`.

### Checklists
- **Purpose:** Granular tracking of repetitive tasks (e.g., Store opening checklist).
- **Backend Flow:** Checklist entities contain multiple `ChecklistItem` entities (One-to-Many). Items can be toggled Complete/Incomplete via PUT endpoints.

---

# 7. API Documentation

| API Endpoint | Method | Purpose | Request Body | Response | Auth Required |
|---|---|---|---|---|---|
| `/api/auth/login` | POST | Authenticate user | `{username, password}` | `{token, user}` | No |
| `/api/auth/create-user` | POST | Admin creates user | `{username, email, role...}` | Success Msg | Yes (Admin) |
| `/api/auth/me` | GET | Get current logged in user | None | `UserDTO` | Yes |
| `/api/tasks` | GET | List all tasks | None | `List<TaskDTO>` | Yes |
| `/api/tasks` | POST | Create new task | `TaskDTO` | `Task` | Yes |
| `/api/tasks/{id}` | PUT | Update task status/details| `TaskDTO` | `Task` | Yes |
| `/api/checklists` | POST | Create checklist | `ChecklistDTO` | `Checklist` | Yes |
| `/api/checklists/items/{id}/complete` | PUT | Mark checklist item done | None | `ChecklistItem` | Yes |
| `/api/handovers` | POST | Create shift handover | `HandoverDTO` | `Handover` | Yes |
| `/api/handovers/{id}/acknowledge` | PUT | Acknowledge handover | None | Success Msg | Yes |
| `/api/audit-logs` | GET | Get system audit logs | None | `List<AuditLog>`| Yes |

---

# 8. Database Documentation

**1. `users` Table**
- **Columns:** `id`, `username`, `password`, `first_name`, `last_name`, `email`, `role`, `status`, `team_id`, `shift_id`
- **Purpose:** Stores user accounts and credentials.
- **Relationships:** Belongs to a `Team` (ManyToOne), Belongs to a `Shift` (ManyToOne).

**2. `projects` Table**
- **Columns:** `id`, `name`, `description`, `status`, `start_date`, `end_date`
- **Purpose:** Top-level grouping of tasks.

**3. `tasks` Table**
- **Columns:** `id`, `title`, `description`, `status`, `priority`, `project_id`, `team_id`, `assigned_to_id`, `created_by_id`, `due_date`
- **Purpose:** Core work item.
- **Relationships:** ManyToOne with `User` (Assignee), `User` (Creator), `Project`, `Team`.

**4. `checklists` & `checklist_items` Tables**
- **Purpose:** Checklists linked to shifts/teams/tasks. Items represent individual boolean checkboxes.
- **Relationships:** `checklists` has a OneToMany mapping to `checklist_items` with `cascade = CascadeType.ALL, orphanRemoval = true`.

**5. `handovers` & `handover_notes` Tables**
- **Purpose:** Documents transition between shifts.
- **Columns:** `shift_id`, `passing_team_id`, `receiving_team_id`, `acknowledged`.

**6. `audit_logs` Table**
- **Columns:** `id`, `action`, `entity_type`, `entity_id`, `user_id`, `details`, `timestamp`.
- **Purpose:** Compliance and accountability. Tracks WHO did WHAT and WHEN.

---

# 9. Complete Code Flow (Example: Fetching My Tasks)

**1. User Interaction:** User navigates to `/tasks` in React app.
**2. Frontend:** `Tasks.jsx` mounts. `useEffect` hook triggers `taskService.getMyTasks()`.
**3. Axios:** Interceptor adds `Authorization: Bearer <token>`. Request goes to `GET /api/tasks/my-tasks`.
**4. Filter Chain:** `JwtAuthenticationFilter` reads token, parses username, fetches UserDetails, sets `SecurityContextHolder`.
**5. Controller:** `TaskController.getMyTasks(@AuthenticationPrincipal UserDetails userDetails)` is invoked.
**6. Service:** Controller extracts username and passes it to `TaskService`. Service queries `UserRepository` to get the User Entity. Then calls `TaskRepository.findByAssignedToId(userId)`.
**7. Repository:** Hibernate translates this to `SELECT * FROM tasks WHERE assigned_to_id = ?`.
**8. Response Mapping:** `TaskService` maps `Task` entities to `TaskDTOs` to avoid serializing internal object proxies and circular references.
**9. Frontend Rendering:** Axios receives JSON array. React State `setTasks(data)` is called. The UI re-renders, displaying the list of tasks.

---

# 10. Security Concepts Used

- **JWT (JSON Web Tokens):** Used for stateless authentication. Contains a payload (username, expiration) signed with an HMAC SHA secret key. It prevents session hijacking and eliminates server-side session memory overhead.
- **Authentication:** Proving WHO the user is. Handled via `/api/auth/login` and `CustomUserDetailsService`.
- **Authorization:** Proving WHAT the user can do. Handled via RBAC (Role-Based Access Control) using `@PreAuthorize("hasRole('ADMIN')")`.
- **Password Encryption:** Passwords are NEVER stored in plain text. `BCryptPasswordEncoder` uses salt and hashing to protect against rainbow table attacks.
- **CORS (Cross-Origin Resource Sharing):** Configured in `SecurityConfig.java` to explicitly allow requests from `http://localhost:5173` (Vite dev server) to prevent the browser from blocking cross-origin API calls.
- **Input Validation:** `@Valid` on Controller DTO parameters ensures data integrity before hitting the database (e.g., checking for nulls or invalid email formats).

---

# 11. Important Concepts Reviewers May Ask

**1. REST API (Representational State Transfer)**
- **Definition:** Architectural style for networked applications using standard HTTP methods.
- **Implementation:** Standard use of GET (fetch), POST (create), PUT (update), DELETE in controllers.

**2. Dependency Injection (DI) & Inversion of Control (IoC)**
- **Definition:** Spring injects dependencies automatically instead of classes instantiating them manually.
- **Implementation:** Constructor injection using Lombok's `@RequiredArgsConstructor`. E.g., `TaskController` depends on `TaskService`.

**3. Hibernate & JPA (Java Persistence API)**
- **Definition:** JPA is the specification; Hibernate is the implementation. It maps Java Objects to Database tables (ORM).
- **Implementation:** `@Entity`, `@Id`, `@OneToMany` annotations in the `entity/` package.

**4. Lazy vs Eager Loading**
- **Definition:** Lazy loading fetches related data only when accessed. Eager fetches it immediately via JOINs.
- **Implementation:** We used `fetch = FetchType.LAZY` on relationships (like `@ManyToOne` in `Task.java` for `Project`) to optimize performance and prevent the "N+1 select problem".

**5. React Context API**
- **Definition:** A way to share data deeply throughout the React tree without prop drilling.
- **Implementation:** `AuthContext` provides `user` and `token` state to all components (e.g., Navbar needs user name, ProtectedRoute needs token).

---

# 12. Most Likely Viva Questions

### Architecture & Backend (Spring Boot)
**Q1: Why did you use DTOs instead of returning Entities directly?**
*Answer:* Returning Entities directly causes circular reference errors (JSON Infinite Recursion) due to bidirectional relationships (e.g., Task has a User, User has Tasks). DTOs also prevent Over-Posting attacks by hiding internal fields like passwords or created/updated timestamps from the client API payload.

**Q2: How does your application handle Security?**
*Answer:* I implemented Spring Security with JWT. A `JwtAuthenticationFilter` intercepts every request, extracts the Bearer token, validates it using a secret key, and constructs an Authentication object in the SecurityContext. Passwords are encrypted using BCrypt.

**Q3: What is the N+1 problem in Hibernate and how do you solve it?**
*Answer:* It happens when a query fetches 1 parent entity, and then executes N additional queries to fetch its children lazily. I mitigate this by using `FetchType.LAZY` appropriately, and if I need the data, I can write a custom `@Query("SELECT t FROM Task t JOIN FETCH t.project")` in the repository.

**Q4: Why use `@RequiredArgsConstructor` instead of `@Autowired`?**
*Answer:* `@RequiredArgsConstructor` (from Lombok) generates a constructor for all `final` fields. Constructor injection is recommended over field injection (`@Autowired`) because it allows the class to be instantiated in tests without a Spring Context (making mock injection easier) and ensures the dependency is not null.

### Frontend (React)
**Q5: Why did you choose Context API instead of Redux?**
*Answer:* Our global state is relatively simple, primarily just authentication status, user profile data, and token. Redux introduces significant boilerplate (actions, reducers, store configuration) which was overkill for this requirement. Context API provides an elegant, native solution for this scale.

**Q6: How does the Axios Interceptor work in your project?**
*Answer:* In `services/api.js`, I defined a request interceptor. Before any Axios request leaves the frontend, the interceptor checks `localStorage` for a JWT token. If present, it attaches it to the `Authorization: Bearer` header. The response interceptor catches 401 Unauthorized errors and redirects the user to the login page automatically.

**Q7: How are protected routes implemented?**
*Answer:* I created a `ProtectedRoute.jsx` component that wraps all private routes. It reads the auth state from `AuthContext`. If there is no token/user, it returns `<Navigate to="/login" />`. Otherwise, it returns `{children}` (the requested page).

### Database
**Q8: Explain the relationship between Task and User.**
*Answer:* It is a Many-to-One relationship. A User (assignee) can have many Tasks, but a specific Task is assigned to one User. In `Task.java`, it is represented by `@ManyToOne @JoinColumn(name = "assigned_to_id") private User assignedTo;`.

**Q9: What happens if a User is deleted? How does it affect Tasks?**
*Answer:* Currently, we avoid hard deleting users to preserve historical data. Instead, users have a `status` field (ACTIVE/INACTIVE). If we did hard delete, we would get a Foreign Key Constraint violation unless we set `CascadeType.REMOVE`, which we don't want because tasks shouldn't disappear if a user leaves.

---

# 13. Code Walkthrough Guide

*When the reviewer asks you to present your code, follow this script:*

1. **"Let's start with the database architecture."**
   - Open `Task.java` and `User.java`. Show the `@Entity` and `@ManyToOne` annotations. Explain how Hibernate automatically maps this to Postgres. Explain `FetchType.LAZY` for performance.
2. **"Now let's look at the Business Logic and Auditing."**
   - Open `TaskService.java`. Show the `createTask()` method. Point out how you map the DTO, save the repository, and immediately call `auditLogService.logAction(...)` to maintain a secure audit trail.
3. **"Moving to Security."**
   - Open `SecurityConfig.java`. Show the stateless session policy and the CORS configuration.
   - Open `JwtAuthenticationFilter.java` and explain how the token is extracted from the header and validated per request.
4. **"For the Frontend Architecture."**
   - Open `App.jsx`. Show the routing setup and how `<ProtectedRoute>` wraps the main layout.
   - Open `api.js`. Highlight the Axios interceptors to show how JWT tokens are automatically managed without polluting component logic.
5. **"Finally, state management."**
   - Open `AuthContext.jsx`. Briefly show how login state is provided globally.

*Reviewer Focus Areas:* They will look closely at your Security Filter, your Axios Interceptor, and how you handle Exception handling (mention your `@ControllerAdvice` global exception handler).

---

# 14. Reviewer Trap Questions

**Trap 1: "Why did you use REST instead of GraphQL?"**
*Answer:* The data access patterns in this application are highly predictable (e.g., getting tasks for a user, or users for a team). GraphQL excels when clients need highly flexible data shapes to prevent over-fetching, but our DTOs are already optimized for our specific views. REST is simpler, easier to cache, and perfectly suited for this standard CRUD-heavy workflow.

**Trap 2: "Is storing JWT in localStorage secure?"**
*Answer:* Storing JWT in `localStorage` is vulnerable to Cross-Site Scripting (XSS) attacks. I chose it for simplicity in this iteration. In a production environment with strict security requirements, storing the token in an `HttpOnly`, `Secure` cookie is safer against XSS, though it requires CSRF protection.

**Trap 3: "Why use Spring Boot over Node.js for backend?"**
*Answer:* Spring Boot provides strong typing with Java, excellent ORM capabilities with Hibernate, and an incredibly robust built-in security framework (Spring Security). For an enterprise workflow tool dealing with roles, complex relational tables, and audit logs, Spring Boot's structured architecture ensures higher maintainability and fewer runtime type errors than a JS-based backend.

---

# 15. Project Strengths

- **Accountability via Audit Logs:** Every critical action is tracked in the database, making it a true enterprise tool.
- **Robust Security:** Stateless JWT authentication with strictly enforced method-level role authorization (`@PreAuthorize`).
- **Clean Architecture:** Strict separation of concerns (Controllers handle HTTP, Services handle logic, Repositories handle Data, DTOs handle serialization).
- **Scalability:** By keeping the backend stateless (JWT instead of sessions), multiple backend instances could be spun up behind a load balancer without session stickiness issues.

---

# 16. Limitations & Future Enhancements

- **Limitation:** Lack of real-time updates. When a manager assigns a task, the user must refresh to see it.
  - *Enhancement:* Implement WebSockets (Spring WebSocket + STOMP) or Server-Sent Events (SSE) to push task notifications instantly to the frontend.
- **Limitation:** Hard deletion of some resources.
  - *Enhancement:* Implement "Soft Deletes" using Hibernate's `@SQLDelete` and `@Where(clause = "deleted=false")` across all entities to preserve historical data integrity completely.
- **Enhancement:** Implement pagination (`Pageable` in Spring Data) for the `/api/tasks` and `/api/audit-logs` endpoints. Currently, it returns lists, which might slow down if the database grows to thousands of records.

---

# 17. Final 10-Minute Review Preparation Sheet

**Project Summary:** An internal Jira-like workflow and shift handover manager using React + Spring Boot + Postgres.
**Core Architecture:** Single Page Application (SPA) consuming stateless REST APIs secured by JWT.
**Key Tables:** `users`, `tasks`, `checklists`, `handovers`, `audit_logs`.
**Security Flow:** Login -> Generate JWT (HMAC-SHA key) -> Frontend stores in `localStorage` -> Axios Interceptor attaches to header -> Backend `OncePerRequestFilter` validates token -> Sets Spring Security Context.
**Important Concepts to remember:**
- **DTOs:** Prevent infinite recursion and over-posting.
- **Lazy Loading:** Prevents N+1 queries.
- **Context API:** Global state for auth without Redux overhead.
- **Axios Interceptors:** Centralized API token management.

*Deep breath. You know this codebase perfectly. You got this!*
