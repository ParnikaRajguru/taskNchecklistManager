# 🏪 Store Task & Checklist Manager — COMPLETE PROJECT EXPLANATION

> **Project Type:** Internal Workflow Management System  
> **Stack:** Java Spring Boot (Backend) + React (Frontend) + PostgreSQL (Database)  
> **Purpose:** Manage tasks, teams, projects, shifts, checklists, and shift handovers for a retail store

---

# 📚 TABLE OF CONTENTS

1. [What Is This Project?](#1-what-is-this-project)
2. [Project Folder Structure](#2-project-folder-structure)
3. [Backend Architecture (Spring Boot)](#3-backend-architecture)
4. [Frontend Architecture (React)](#4-frontend-architecture)
5. [Database Design & Relationships](#5-database-design)
6. [Complete File-by-File Explanation](#6-file-by-file-explanation)
   - [Backend Files](#61-backend-files)
   - [Frontend Files](#62-frontend-files)
7. [Complete Flow Explanations](#7-complete-flow-explanations)
   - [Login Flow](#71-login-flow)
   - [User Creation Flow](#72-user-creation-flow)
   - [Task Creation Flow](#73-task-creation-flow)
   - [Team Creation Flow](#74-team-creation-flow)
   - [Checklist Flow](#75-checklist-flow)
   - [Dashboard Flow](#76-dashboard-flow)
8. [Concept Library](#8-concept-library)
9. [Interview/Viva Preparation](#9-interview-preparation)

---

# 1. WHAT IS THIS PROJECT?

Imagine you work in a big retail store. You have:

- **Multiple teams** (Frontend developers, Backend developers, QA testers)
- **Multiple shifts** (Morning 6AM-2PM, Evening 2PM-10PM, Night 10PM-6AM)
- **Projects** (like building a new website or inventory system)
- **Tasks** assigned to people (like "Design homepage" or "Write tests")
- **Checklists** that each shift must complete (like "Check all entrances" or "Cash reconciliation")
- **Handovers** when one shift finishes and hands work to the next shift

This project is a **web application** that lets store managers and employees:

- Log in securely with username/password
- See a dashboard showing task progress
- Create and manage users, teams, projects, tasks
- Create shift checklists and mark items complete
- Create shift handover reports
- Track everything with audit logs

Think of it as a **simplified Trello + Jira + Slack combo** built specifically for retail store operations.

---

# 2. PROJECT FOLDER STRUCTURE

```
taskNchecklistManager/
│
├── backend/                          # Java Spring Boot Backend
│   ├── pom.xml                       # Maven build file (dependencies)
│   └── src/
│       ├── main/
│       │   ├── java/com/store/taskmanager/
│       │   │   ├── TaskManagerApplication.java    # Entry point
│       │   │   ├── config/
│       │   │   │   ├── SecurityConfig.java        # Spring Security setup
│       │   │   │   └── DataInitializer.java       # Creates sample data
│       │   │   ├── controller/        # REST API endpoints (11 files)
│       │   │   ├── service/           # Business logic (11 files)
│       │   │   ├── repository/        # Database access (10 files)
│       │   │   ├── entity/            # Database models (10 files)
│       │   │   │   └── enums/         # Enum types (5 files)
│       │   │   ├── dto/               # Data Transfer Objects (25 files)
│       │   │   ├── security/          # JWT auth (3 files)
│       │   │   └── exception/         # Error handling (3 files)
│       │   └── resources/
│       │       └── application.properties  # Config (DB, JWT, etc.)
│       └── target/                    # Compiled .class files
│
├── frontend/                         # React Frontend
│   ├── package.json                  # npm dependencies
│   ├── vite.config.js                # Vite build config
│   ├── tailwind.config.js            # Tailwind CSS config
│   ├── index.html                    # HTML entry
│   └── src/
│       ├── main.jsx                  # React entry point
│       ├── App.jsx                   # Routes setup
│       ├── index.css                 # Global styles + Tailwind
│       ├── services/
│       │   └── api.js                # All Axios API calls
│       ├── context/
│       │   └── AuthContext.jsx        # Login state management
│       ├── components/
│       │   ├── Layout.jsx             # Sidebar + header layout
│       │   └── ProtectedRoute.jsx     # Route guard (login check)
│       └── pages/
│           ├── Login.jsx
│           ├── Dashboard.jsx
│           ├── Users.jsx
│           ├── Teams.jsx
│           ├── Projects.jsx
│           ├── Tasks.jsx
│           ├── Shifts.jsx
│           ├── Checklists.jsx
│           └── Handovers.jsx
│
├── database/
│   ├── init.sql                      # Database setup instructions
│   ├── sample-data.sql               # Manual SQL seed data
│   └── load-sample-data.bat          # Windows batch file to run seed
│
└── README.md                         # Project documentation
```

---

# 3. BACKEND ARCHITECTURE

## 3.1 Layered Architecture Explained

The backend follows **Layered Architecture** (also called N-tier architecture). Think of it like a restaurant:

```
[Controller Layer]   = Waiter (takes order, serves response)
       ↓
[Service Layer]      = Chef (cooks food, business logic)
       ↓
[Repository Layer]   = Kitchen storage (gets ingredients from fridge)
       ↓
[Database]           = Fridge/Storage (where everything is stored)
```

**Why separate layers?** If you want to change how you store data (e.g., switch from PostgreSQL to MongoDB), you only change the Repository layer. The Controller doesn't need to change.

## 3.2 Each Layer Explained

### Entity Layer (`entity/`)
- These are Java classes that **map to database tables**
- Each entity = one database table
- Each field = one database column
- Uses JPA annotations (@Entity, @Table, @Column, @Id)
- Example: `User.java` maps to `users` table

### Repository Layer (`repository/`)
- Interfaces that **talk to the database**
- Extends `JpaRepository<EntityType, IdType>`
- Spring automatically provides: `save()`, `findAll()`, `findById()`, `delete()`
- You can add custom queries like `findByUsername()`

### Service Layer (`service/`)
- Contains **business logic** (rules, validation)
- Controllers call services, services call repositories
- Example: "Check if username already exists before saving"

### Controller Layer (`controller/`)
- **REST API endpoints** that the frontend calls
- Maps URLs to Java methods
- Example: `@GetMapping("/api/users")` → returns all users

### DTO Layer (`dto/`)
- **Data Transfer Objects** - special objects for sending data between frontend and backend
- Why not use Entity directly? You don't want to expose passwords, and you want to control what the frontend sees

### Security Layer (`security/`)
- Handles **authentication** (who are you?) and **authorization** (what can you do?)
- Uses JWT (JSON Web Tokens)

---

# 4. FRONTEND ARCHITECTURE

## 4.1 React Component Tree

```
main.jsx (entry point)
  └── App.jsx (routing)
       ├── Login.jsx (no layout, no protection)
       └── ProtectedRoute.jsx (checks if logged in)
            └── Layout.jsx (sidebar + header)
                 ├── Dashboard.jsx
                 ├── Users.jsx
                 ├── Teams.jsx
                 ├── Projects.jsx
                 ├── Tasks.jsx
                 ├── Shifts.jsx
                 ├── Checklists.jsx
                 └── Handovers.jsx
```

## 4.2 Data Flow Pattern

Every page follows this pattern:

```
1. Component loads (useEffect)
2. Calls API function from services/api.js
3. Axios sends HTTP request to backend (with JWT token)
4. Backend processes, sends JSON response
5. Axios receives JSON
6. Component stores data in useState
7. React re-renders UI with the data
8. When user clicks "Create"/"Edit", form data is sent back
9. Component reloads data (to show latest)
```

---

# 5. DATABASE DESIGN & RELATIONSHIPS

## 5.1 Entity Relationship Diagram (Text-Based)

```
Project
   │
   ├──< Team (One Project has Many Teams)
   │      │
   │      ├──< User (One Team has Many Users)
   │      │
   │      ├──< Task (One Team has Many Tasks)
   │      │
   │      └──< Shift (One Team has Many Shifts)
   │             │
   │             └──< Checklist (One Shift has Many Checklists)
   │                    │
   │                    └──< ChecklistItem (One Checklist has Many Items)
   │
   └──< Task (One Project has Many Tasks)

User
   ├──> Team (Many Users belong to One Team)  [team_id FK]
   ├──> Shift (Many Users belong to One Shift) [shift_id FK]
   ├──< Task (assignedTo - One User has Many Tasks)
   ├──< Task (createdBy - One User has Many Tasks)
   ├──< Checklist (createdBy)
   ├──< ChecklistItem (assignedTo)
   ├──< ChecklistItem (completedBy)
   ├──< Handover (createdBy)
   ├──< Note (createdBy)
   └──< AuditLog (performedBy)

Shift
   ├──< Checklist
   ├──< Handover (fromShift)
   └──< Handover (toShift)

Task
   ├──< ChecklistItem
   └──< Note

Handover
   └──< Note
```

## 5.2 Relationship Types Explained

### @ManyToOne (Many entities belong to ONE entity)
```java
// Many Users can belong to one Team
@ManyToOne
@JoinColumn(name = "team_id")  // This creates a column in users table
private Team team;
```
**In the database:** The `users` table has a column `team_id` that stores the ID of the team.

### @OneToMany (One entity has MANY entities)
```java
// One Team can have many Users
@OneToMany(mappedBy = "team")
private List<User> members = new ArrayList<>();
```
**mappedBy = "team"** means: "Look at the User entity's 'team' field. That's where the relationship is defined."

### Cascade Types
```java
@OneToMany(mappedBy = "checklist", cascade = CascadeType.ALL, orphanRemoval = true)
private List<ChecklistItem> items;
```
- **CascadeType.ALL**: If you save/delete a Checklist, also save/delete its items
- **orphanRemoval = true**: If you remove an item from the list, delete it from database

### Fetch Types
- **FetchType.LAZY**: Load related data only when accessed (better performance)
- **FetchType.EAGER**: Always load related data immediately

## 5.3 Complete Table Structure

### users table
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT (PK) | Auto-generated |
| username | VARCHAR (UNIQUE) | Login username |
| password | VARCHAR | BCrypt encrypted |
| first_name | VARCHAR | |
| last_name | VARCHAR | |
| email | VARCHAR (UNIQUE) | |
| phone | VARCHAR | Optional |
| status | VARCHAR | "ACTIVE" by default |
| role | VARCHAR (ENUM) | SUPER_ADMIN, MANAGER, TEAM_LEAD, DEVELOPER, TESTER, STAFF |
| team_id | BIGINT (FK → teams) | Which team they belong to |
| shift_id | BIGINT (FK → shifts) | Which shift they work |
| first_login | BOOLEAN | True until they change password |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### teams table
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT (PK) | |
| name | VARCHAR | |
| description | TEXT | |
| project_id | BIGINT (FK → projects) | |
| manager_id | BIGINT (FK → users) | The manager of this team |
| team_lead_id | BIGINT (FK → users) | The team lead |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### projects table
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT (PK) | |
| name | VARCHAR | |
| description | TEXT | |
| status | VARCHAR | ACTIVE, ON_HOLD, COMPLETED, PLANNING |
| start_date | DATE | |
| end_date | DATE | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### tasks table
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT (PK) | |
| title | VARCHAR | |
| description | TEXT | |
| status | VARCHAR (ENUM) | TODO, IN_PROGRESS, IN_REVIEW, TESTING, COMPLETED, BLOCKED |
| priority | VARCHAR (ENUM) | LOW, MEDIUM, HIGH |
| project_id | BIGINT (FK → projects) | |
| team_id | BIGINT (FK → teams) | |
| assigned_to_id | BIGINT (FK → users) | Who is doing this task |
| created_by_id | BIGINT (FK → users) | Who created this task |
| due_date | DATE | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### shifts table
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT (PK) | |
| name | VARCHAR | "Morning Shift" |
| shift_type | VARCHAR (ENUM) | MORNING, EVENING, NIGHT |
| start_time | TIME | 06:00:00 |
| end_time | TIME | 14:00:00 |
| active | BOOLEAN | |
| team_id | BIGINT (FK → teams) | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### checklists table
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT (PK) | |
| title | VARCHAR | "Morning Checklist" |
| description | TEXT | |
| shift_id | BIGINT (FK → shifts) | Which shift this is for |
| team_id | BIGINT (FK → teams) | Which team is responsible |
| created_by_id | BIGINT (FK → users) | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### checklist_items table
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT (PK) | |
| title | VARCHAR | "Check entrances" |
| description | TEXT | |
| completed | BOOLEAN | |
| checklist_id | BIGINT (FK → checklists) | |
| assigned_to_id | BIGINT (FK → users) | |
| task_id | BIGINT (FK → tasks) | Optional link to task |
| completed_by_id | BIGINT (FK → users) | Who marked it done |
| completed_at | TIMESTAMP | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### handovers table
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT (PK) | |
| title | VARCHAR | |
| completed_work | TEXT | What was done this shift |
| pending_work | TEXT | What still needs doing |
| blockers | TEXT | Problems faced |
| next_shift_instructions | TEXT | Guidance for next shift |
| from_shift_id | BIGINT (FK → shifts) | Current shift |
| to_shift_id | BIGINT (FK → shifts) | Next shift |
| assigned_team_id | BIGINT (FK → teams) | |
| receiving_team_id | BIGINT (FK → teams) | |
| priority | VARCHAR (ENUM) | LOW, MEDIUM, HIGH, CRITICAL |
| project_id | BIGINT (FK → projects) | |
| created_by_id | BIGINT (FK → users) | |
| resolved | BOOLEAN | Is this handover done? |
| acknowledged | BOOLEAN | Did next shift confirm? |
| acknowledged_at | TIMESTAMP | |
| created_at | TIMESTAMP | |
| updated_at | TIMESTAMP | |

### notes table
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT (PK) | |
| content | TEXT | |
| created_by_id | BIGINT (FK → users) | |
| task_id | BIGINT (FK → tasks) | Optional |
| checklist_item_id | BIGINT (FK → checklist_items) | Optional |
| handover_id | BIGINT (FK → handovers) | Optional |
| created_at | TIMESTAMP | |

### audit_logs table
| Column | Type | Notes |
|--------|------|-------|
| id | BIGINT (PK) | |
| action | VARCHAR | "USER_CREATED", "TASK_UPDATED", etc. |
| entity_type | VARCHAR | "User", "Task", "Team", etc. |
| entity_id | BIGINT | Which entity was changed |
| old_value | TEXT | Previous value (if applicable) |
| new_value | TEXT | New value (if applicable) |
| performed_by_id | BIGINT (FK → users) | Who did the action |
| timestamp | TIMESTAMP | When it happened |

---

# 6. FILE-BY-FILE EXPLANATION

---

## 6.1 BACKEND FILES

---

### 📄 `pom.xml` — Maven Build File

**Purpose:** Tells Maven what libraries (dependencies) the project needs.

**Key Dependencies:**
- `spring-boot-starter-web` — Makes Spring Boot a web server (handles HTTP requests)
- `spring-boot-starter-data-jpa` — Lets you work with databases using JPA/Hibernate
- `spring-boot-starter-security` — Adds login, passwords, security
- `spring-boot-starter-validation` — Validates user input (e.g., "email must be valid")
- `postgresql` — Database driver for PostgreSQL
- `jjwt-api`, `jjwt-impl`, `jjwt-jackson` — JWT library for creating/validating tokens
- `lombok` — Saves typing: generates getters/setters/constructors automatically

**Why Maven?** It automatically downloads all these libraries from the internet. Without it, you'd have to manually download JAR files.

---

### 📄 `application.properties` — Configuration File

**Purpose:** Settings for the application.

```properties
server.port=8080                                    # Backend runs on port 8080
spring.datasource.url=jdbc:postgresql://localhost:5432/taskmanager  # Database location
spring.datasource.username=postgres                 # Database username
spring.datasource.password=postgres                 # Database password
spring.jpa.hibernate.ddl-auto=update                # Auto-create/update tables
app.jwt.secret=YourSuperSecretKey...                 # Secret key for JWT signing
app.jwt.expiration=86400000                         # Token expiry (24 hours in ms)
```

**Important:** `ddl-auto=update` means Hibernate automatically creates/modifies database tables based on your Entity classes. You don't need to write CREATE TABLE statements.

---

### 📄 `TaskManagerApplication.java` — Entry Point

```java
@SpringBootApplication
public class TaskManagerApplication {
    public static void main(String[] args) {
        SpringApplication.run(TaskManagerApplication.class, args);
    }
}
```

- `@SpringBootApplication` is a shortcut for three annotations:
  - `@Configuration` — This class can define beans
  - `@EnableAutoConfiguration` — Spring Boot auto-configures itself
  - `@ComponentScan` — Finds all other components (controllers, services, etc.)
- `SpringApplication.run()` starts the entire application (embedded Tomcat server)

---

### 📄 `SecurityConfig.java` — Security Setup

**Purpose:** Configures who can access what, how passwords are stored, and JWT filter.

**What it does:**
1. Creates a `PasswordEncoder` (BCrypt) — hashes passwords so they're not stored in plain text
2. Creates an `AuthenticationManager` — manages login verification
3. Sets up CORS — allows frontend (localhost:5173) to talk to backend (localhost:8080)
4. Configures `SecurityFilterChain` — the security rules:
   - `/api/auth/**` — anyone can access (login, register)
   - `OPTIONS` requests — anyone can access (browser preflight)
   - Everything else — must be authenticated
5. Disables CSRF (not needed for REST APIs with JWT)
6. Sets session management to STATELESS (no cookies, uses JWT token)
7. Adds `JwtAuthenticationFilter` before the standard username/password filter

```java
// This line means: any request matching /api/auth/** is public (no login needed)
.requestMatchers("/api/auth/**").permitAll()
// Everything else needs authentication
.anyRequest().authenticated()
```

**Why STATELESS?** Traditional web apps use sessions (cookies on server). REST APIs use JWT tokens (client sends token with every request). No session data stored on server = scalable.

---

### 📄 `JwtTokenProvider.java` — JWT Token Creation & Validation

**Purpose:** Creates and validates JWT tokens.

**How JWT works (simple explanation):**
```
HEADER    | PAYLOAD            | SIGNATURE
{"alg":   | {"sub": "admin",   | [encrypted with
 "HS256"} | "iat": 123,        |  secret key]
          | "exp": 456}        |
```

**Key Methods:**

- `init()` — Runs when application starts. Takes the secret string from properties and creates a signing key.
- `generateToken(Authentication)` — Creates a JWT string with username, issue date, expiry date, signed with secret key
- `getUsernameFromToken(token)` — Reads the token and extracts the username
- `validateToken(token)` — Checks if the token is valid (not expired, properly signed)

```java
public String generateToken(Authentication authentication) {
    return Jwts.builder()
            .subject(userDetails.getUsername())  // Store username in token
            .issuedAt(now)                        // When token was created
            .expiration(expiryDate)               // When token expires
            .signWith(signingKey)                 // Sign with secret key
            .compact();                           // Convert to string
}
```

---

### 📄 `JwtAuthenticationFilter.java` — Intercepts Every Request

**Purpose:** A filter that runs on EVERY HTTP request. Checks if the request has a valid JWT token.

Think of it as a security guard checking ID at the entrance.

```java
// This runs for every request
protected void doFilterInternal(request, response, filterChain) {
    // 1. Extract JWT from "Authorization: Bearer <token>" header
    String jwt = getJwtFromRequest(request);
    
    // 2. If token exists and is valid
    if (StringUtils.hasText(jwt) && tokenProvider.validateToken(jwt)) {
        // 3. Get username from token
        String username = tokenProvider.getUsernameFromToken(jwt);
        // 4. Load user details from database
        UserDetails userDetails = userDetailsService.loadUserByUsername(username);
        // 5. Create authentication object
        UsernamePasswordAuthenticationToken authentication = ...;
        // 6. Set authentication in SecurityContext (user is now "logged in")
        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
    // 7. Continue with the request
    filterChain.doFilter(request, response);
}
```

**Important:** This filter runs before the request reaches the controller. If token is invalid, the request is rejected.

---

### 📄 `CustomUserDetailsService.java` — Loads User from Database

**Purpose:** Spring Security needs to load user details to verify login. This class tells Spring how to find users.

```java
public UserDetails loadUserByUsername(String username) {
    // Find user in database
    User user = userRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    
    // Convert our User entity to Spring Security's UserDetails
    return new org.springframework.security.core.userdetails.User(
            user.getUsername(),
            user.getPassword(),
            Collections.singletonList(
                new SimpleGrantedAuthority("ROLE_" + user.getRole().name())
            )
    );
}
```

**Note:** `ROLE_` prefix is important. Spring Security's `hasRole('SUPER_ADMIN')` actually checks for `ROLE_SUPER_ADMIN`.

---

### 📄 `DataInitializer.java` — Creates Sample Data

**Purpose:** When the application starts for the first time (empty database), it creates sample data so you can immediately test the application.

**`CommandLineRunner` interface:** Spring runs this after the application starts.

**Flow:**
1. Check if shifts exist → if not, create Morning (6-2), Evening (2-10), Night (10-6)
2. Create admin user (admin/admin123)
3. Check if seed data already exists → if yes, skip
4. Create 8 sample users (manager, leads, staff)
5. Create 3 projects
6. Create 4 teams with members
7. Create 8 tasks with different statuses
8. Create 4 checklists with 8 items
9. Create 3 handovers

**Why this file exists:** So you don't have to manually type data to test the application.

---

### 📄 `User.java` — User Entity

**Purpose:** Maps to the `users` table in PostgreSQL.

```java
@Entity                              // This class is a database entity
@Table(name = "users")               // Maps to "users" table
@Data                                // Lombok: generates getters, setters, toString, equals, hashCode
@NoArgsConstructor                   // Generates empty constructor: new User()
@AllArgsConstructor                  // Generates constructor with all fields
public class User {

    @Id                              // Primary key
    @GeneratedValue(strategy = GenerationType.IDENTITY)  // Auto-increment
    private Long id;

    @Column(unique = true, nullable = false)  // UNIQUE constraint, cannot be NULL
    private String username;

    @Column(nullable = false)
    private String password;          // BCrypt hashed

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(unique = true, nullable = false)
    private String email;

    private String phone;             // Optional field (nullable)

    @Column(nullable = false)
    private String status = "ACTIVE"; // Default value: new users are ACTIVE

    @Enumerated(EnumType.STRING)      // Store enum as string "MANAGER" not number 1
    @Column(nullable = false)
    private Role role;                // SUPER_ADMIN, MANAGER, TEAM_LEAD, etc.

    @ManyToOne(fetch = FetchType.LAZY) // Many users → One team
    @JoinColumn(name = "team_id")      // Foreign key column name
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY) // Many users → One shift
    @JoinColumn(name = "shift_id")
    private Shift shift;

    private boolean firstLogin = true; // New users must change password

    private LocalDateTime createdAt;   // Set automatically
    private LocalDateTime updatedAt;

    @PrePersist                        // Runs BEFORE saving for first time
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate                         // Runs BEFORE updating
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public String getFullName() {      // Helper method
        return firstName + " " + lastName;
    }
}
```

**Key Concepts:**
- `@GeneratedValue(IDENTITY)`: Database auto-increment. PostgreSQL creates a SEQUENCE.
- `@Enumerated(EnumType.STRING)`: Saves role as "MANAGER" not 0/1/2. Easier to read in database.
- `FetchType.LAZY`: When you load a User, don't immediately load their Team. Load it only when `user.getTeam()` is called.
- `@PrePersist`/`@PreUpdate`: Lifecycle callbacks. Automatically set timestamps.

---

### 📄 `Role.java` — Enum for User Roles

```java
public enum Role {
    SUPER_ADMIN,   // Full access to everything
    MANAGER,       // Can manage teams, projects, create users
    TEAM_LEAD,     // Can manage their team's tasks
    DEVELOPER,     // Regular developer
    TESTER,        // QA tester
    STAFF          // General staff
}
```

**Enum vs String:** Using enum prevents typos. If you type `"MANAGER"` in code and it's spelled correctly, it compiles. If you type `"MANAGERR"`, the compiler catches it.

---

### 📄 `TaskStatus.java`, `TaskPriority.java`, `ShiftType.java`, `HandoverPriority.java`

These are simple enums that define allowed values:

| Enum | Values |
|------|--------|
| TaskStatus | TODO, IN_PROGRESS, IN_REVIEW, TESTING, COMPLETED, BLOCKED |
| TaskPriority | LOW, MEDIUM, HIGH |
| ShiftType | MORNING, EVENING, NIGHT |
| HandoverPriority | LOW, MEDIUM, HIGH, CRITICAL |

---

### 📄 `UserRepository.java` — User Database Operations

```java
@Repository                                            // Spring bean (database access)
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Spring Data JPA automatically implements these based on method names!
    
    Optional<User> findByUsername(String username);     // SELECT * FROM users WHERE username = ?
    boolean existsByUsername(String username);          // SELECT COUNT(*) FROM users WHERE username = ?
    boolean existsByEmail(String email);                // SELECT COUNT(*) FROM users WHERE email = ?
    List<User> findByRole(Role role);                   // SELECT * FROM users WHERE role = ?
    List<User> findByTeamId(Long teamId);              // SELECT * FROM users WHERE team_id = ?
    List<User> findByShiftId(Long shiftId);            // SELECT * FROM users WHERE shift_id = ?
}
```

**Magic of Spring Data JPA:** You don't write SQL. Spring reads the method name and creates the query automatically. `findByUsername` → `WHERE username = ?`. `findByTeamId` → `WHERE team_id = ?`.

---

### 📄 `UserService.java` — User Business Logic

**Purpose:** Contains all the rules for managing users.

**Key methods:**
- `getAllUsers()` — Returns all users as DTOs (don't expose passwords!)
- `getUserById(id)` — Find one user or throw error
- `updateUser(id, request, currentUser)` — Update user fields if provided (partial update)
- `resetPassword(id, currentUser)` — Reset to default "password123"
- `changeMyPassword(id, request)` — Verify old password, set new password

**Important pattern: mapToDTO()**
```java
private UserDTO mapToDTO(User user) {
    UserDTO dto = new UserDTO();
    dto.setId(user.getId());
    // ... copy fields but NOT password! ...
    return dto;
}
```

**Why DTO?** The `User` entity has a `password` field. If you send the entity directly to frontend, the password goes too! DTOs let you control exactly what data is sent.

---

### 📄 `AuthService.java` — Authentication Logic

**Purpose:** Login, password change, and user creation.

**Login Flow (in detail):**
```java
public LoginResponse login(LoginRequest request) {
    // 1. Find user in database by username
    User user = userRepository.findByUsername(request.getUsername())
            .orElseThrow(() -> new BadRequestException("Invalid username or password"));
    
    // 2. Verify password using AuthenticationManager
    // This calls CustomUserDetailsService.loadUserByUsername()
    // then compares the password with BCrypt
    Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(
                request.getUsername(), 
                request.getPassword()
            )
    );
    
    // 3. If password matches, generate JWT token
    String token = tokenProvider.generateToken(authentication);
    
    // 4. Return response with token and user info
    return new LoginResponse(token, "Bearer", user.getId(), ...);
}
```

**createUser() — Creating a new user:**
```java
public void createUser(CreateUserRequest request, User currentUser) {
    // 1. Check if username already exists
    if (userRepository.existsByUsername(request.getUsername())) {
        throw new BadRequestException("Username already exists");
    }
    // 2. Check if email already exists
    if (userRepository.existsByEmail(request.getEmail())) {
        throw new BadRequestException("Email already exists");
    }
    // 3. Create User object
    User user = new User();
    user.setUsername(request.getUsername());
    user.setPassword(passwordEncoder.encode(request.getPassword()));  // HASH password!
    // ... set other fields ...
    
    // 4. Save to database
    userRepository.save(user);
}
```

**Password safety:** NEVER store plain text passwords. Always hash with BCrypt. BCrypt automatically adds a "salt" (random data) to make each hash unique.

---

### 📄 `TeamService.java` — Team Business Logic

**Key feature: Validation**
```java
private void validateTeamAssignment(CreateTeamRequest request) {
    // Same person cannot be both manager and team lead
    if (request.getManagerId() != null && request.getTeamLeadId() != null
            && request.getManagerId().equals(request.getTeamLeadId())) {
        throw new BadRequestException("Same person cannot be both manager and team lead");
    }
    // Manager should not also be a member
    if (request.getManagerId() != null && request.getMemberIds() != null
            && request.getMemberIds().contains(request.getManagerId())) {
        throw new BadRequestException("Manager should not be added as a team member");
    }
}
```

**assignMembers()** — When a team is created or updated, this method:
1. Removes any existing members who are no longer in the member list
2. Adds new members by setting their `team` field

**deleteTeam()** — Before deleting a team:
1. Removes all members (sets their `team` to null)
2. Clears manager and team lead references
3. Deletes the team

---

### 📄 `ProjectService.java` — Project Business Logic

**Key feature: Date validation**
```java
private void validateDates(LocalDate startDate, LocalDate endDate) {
    if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
        throw new BadRequestException("End date must be after start date");
    }
}
```

---

### 📄 `TaskService.java` — Task Business Logic

**Key method: `getAccessibleTasks(User user)`**
- If user is SUPER_ADMIN or MANAGER → see all tasks
- If user has a team → see their team's tasks + tasks assigned to them personally
- If user has no team → see only tasks assigned to them

---

### 📄 `ChecklistService.java` — Checklist Business Logic

**Key features:**
- `createChecklist()` — Creates a checklist with items. Uses `addAll()` to add items to Hibernate collection.
- `completeItem()` — Marks item as complete, records who completed it and when
- `uncompleteItem()` — Reverts completion

**Progress calculation:**
```java
long completed = checklist.getItems().stream()
        .filter(ChecklistItem::isCompleted)
        .count();
dto.setProgressPercentage((int) (completed * 100 / checklist.getItems().size()));
```

---

### 📄 `ShiftService.java` — Shift Business Logic

**Key feature: Time validation**
```java
if (startTime != null && endTime != null && !endTime.isAfter(startTime)) {
    throw new BadRequestException("End time must be after start time");
}
```

---

### 📄 `HandoverService.java` — Handover Business Logic

**Key features:**
- `createHandover()` — Creates shift handover report
- `resolveHandover()` — Marks as resolved (work is done)
- `acknowledgeHandover()` — Next shift acknowledges receipt

---

### 📄 `DashboardService.java` — Dashboard Data

**Purpose:** Aggregates data from multiple tables to show on dashboard.

```java
public DashboardDTO getDashboardData(User user) {
    // 1. Determine which tasks the user can see (based on role)
    // 2. Count: total, pending, completed, overdue, blocked tasks
    // 3. Count completed today
    // 4. Find delayed checklists
    // 5. Find missed handovers (for managers)
    // 6. Get recent 10 tasks
    // 7. Get pending handovers for user's shift
    // 8. Get pending checklist items for user's shift
}
```

---

### 📄 `AuditLogService.java` — Audit Logging

**Purpose:** Records every important action for tracking.

```java
public void log(String action, String entityType, Long entityId, 
                String oldValue, String newValue, User performedBy) {
    AuditLog auditLog = new AuditLog();
    auditLog.setAction(action);        // "USER_CREATED", "TASK_UPDATED"
    auditLog.setEntityType(entityType); // "User", "Task"
    auditLog.setEntityId(entityId);     // Which entity ID
    auditLog.setOldValue(oldValue);     // Previous value
    auditLog.setNewValue(newValue);     // New value
    auditLog.setPerformedBy(performedBy); // Who did it
    auditLogRepository.save(auditLog);
}
```

**Why audit logs?** If someone deletes a task accidentally, you can see who did it and when.

---

### 📄 `NoteService.java` — Note Business Logic

**Purpose:** Create notes attached to tasks, checklist items, or handovers.

---

### 📄 `AuthController.java` — Authentication Endpoints

```java
@RestController                     // This class handles HTTP requests
@RequestMapping("/api/auth")         // All endpoints start with /api/auth
public class AuthController {

    @PostMapping("/login")           // POST /api/auth/login
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request)

    @PostMapping("/change-password") // POST /api/auth/change-password
    public ResponseEntity<String> changePassword(...)

    @PostMapping("/create-user")     // POST /api/auth/create-user
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")  // Only admin/manager
    public ResponseEntity<String> createUser(...)

    @GetMapping("/me")               // GET /api/auth/me
    public ResponseEntity<UserDTO> getCurrentUser(...)
}
```

**@Valid annotation:** Before the method runs, Spring validates the request body. If `LoginRequest.username` is null (because `@NotBlank` annotation), Spring returns 400 Bad Request automatically.

---

### 📄 `UserController.java` — User Management Endpoints

| Endpoint | Method | Who can access |
|----------|--------|----------------|
| GET /api/users | List all users | SUPER_ADMIN, MANAGER, TEAM_LEAD |
| GET /api/users/{id} | Get one user | Any authenticated |
| GET /api/users/by-team/{teamId} | Users in a team | Any authenticated |
| GET /api/users/by-role/{role} | Users by role | SUPER_ADMIN, MANAGER |
| PUT /api/users/{id} | Update user | SUPER_ADMIN, MANAGER |
| POST /api/users/{id}/reset-password | Reset password | SUPER_ADMIN, MANAGER |

---

### 📄 `TeamController.java` — Team Management Endpoints

| Endpoint | Method | Who can access |
|----------|--------|----------------|
| GET /api/teams | List teams (managers see all, others see only their team) | Any authenticated |
| POST /api/teams | Create team | SUPER_ADMIN, MANAGER |
| PUT /api/teams/{id} | Update team | SUPER_ADMIN, MANAGER |
| DELETE /api/teams/{id} | Delete team | SUPER_ADMIN only |

---

### 📄 `ProjectController.java` — Project Endpoints

Same pattern as teams. Managers see all projects, others see only projects of their team.

---

### 📄 `TaskController.java` — Task Endpoints

| Endpoint | Description | Create/Delete access |
|----------|-------------|---------------------|
| GET /api/tasks | All tasks (filtered by role) | Any authenticated |
| POST /api/tasks | Create task | SUPER_ADMIN, MANAGER, TEAM_LEAD |
| PUT /api/tasks/{id} | Update task | Any authenticated |
| DELETE /api/tasks/{id} | Delete task | SUPER_ADMIN, MANAGER, TEAM_LEAD |

---

### 📄 `ChecklistController.java` — Checklist Endpoints

| Endpoint | Description | Who can access |
|----------|-------------|----------------|
| GET /api/checklists | All checklists | Any authenticated |
| POST /api/checklists | Create checklist | SUPER_ADMIN, MANAGER, TEAM_LEAD |
| PUT /api/checklists/items/{id}/complete | Mark item done | Any authenticated |
| PUT /api/checklists/items/{id}/uncomplete | Unmark item | Any authenticated |
| DELETE /api/checklists/{id} | Delete checklist | SUPER_ADMIN, MANAGER |

---

### 📄 `ShiftController.java`, `HandoverController.java`, `NoteController.java`

Follow the same pattern: REST endpoints with `@PreAuthorize` for access control.

---

### 📄 `DashboardController.java` — Dashboard Data

```java
@GetMapping
public ResponseEntity<DashboardDTO> getDashboard(
        @AuthenticationPrincipal UserDetails userDetails) {
    User user = userRepository.findByUsername(userDetails.getUsername())
            .orElseThrow(() -> new RuntimeException("User not found"));
    return ResponseEntity.ok(dashboardService.getDashboardData(user));
}
```

---

### 📄 `AuditController.java` — Audit Log Viewing

Only SUPER_ADMIN and MANAGER can view audit logs.

---

### 📄 `GlobalExceptionHandler.java` — Error Handler

**Purpose:** Instead of crashing or returning cryptic errors, this class catches exceptions and returns friendly JSON error messages.

**How it works:**
```java
@RestControllerAdvice  // This class intercepts ALL exceptions from ALL controllers
public class GlobalExceptionHandler {
    
    @ExceptionHandler(ResourceNotFoundException.class)  // Catch specific exception
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        // Return: { "status": 404, "message": "User not found with id: 99" }
    }
    
    @ExceptionHandler(DataIntegrityViolationException.class)  // Database constraint violation
    public ResponseEntity<Map<String, Object>> handleDataIntegrity(DataIntegrityViolationException ex) {
        // Return: { "status": 409, "message": "Username already exists" }
    }
    
    @ExceptionHandler(Exception.class)  // Catch ANY exception (safety net)
    public ResponseEntity<Map<String, Object>> handleGlobal(Exception ex) {
        // Return: { "status": 500, "message": "actual error message" }
    }
}
```

**Why this exists:** Without it, if you try to create a user with duplicate username, the backend would return a full Java stack trace (looks scary). With it, the user sees a clean "Username already exists" message.

---

### 📄 All DTO Files (25 files)

**What is a DTO (Data Transfer Object)?**
- A simple Java class with fields, getters, setters — NO logic
- Used to transfer data between frontend and backend
- Unlike Entity, DTO does NOT have JPA annotations (no @Entity, no @Column)

**Why DTOs exist (3 reasons):**
1. **Security:** Entity has `password`. DTO doesn't. You never accidentally send passwords.
2. **Control:** You decide exactly what fields the frontend sees. Entity might have internal fields.
3. **Flexibility:** DTO can combine fields from multiple entities. E.g., `TeamDTO` has `projectName` from Project entity and `managerName` from User entity.

**Example: `LoginRequest.java`** — What frontend sends when logging in
```java
@Data
public class LoginRequest {
    @NotBlank(message = "Username is required")
    private String username;
    
    @NotBlank(message = "Password is required")
    private String password;
}
```

**Example: `LoginResponse.java`** — What backend returns after successful login
```java
@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;      // JWT token
    private String type;       // "Bearer"
    private Long id;           // User ID
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String role;       // "MANAGER"
    private Long teamId;       // Optional
    private Long shiftId;      // Optional
    private boolean firstLogin;
}
```

---

### 📄 `ResourceNotFoundException.java` & `BadRequestException.java`

Custom exception classes:
```java
@ResponseStatus(HttpStatus.NOT_FOUND)  // Returns 404 status
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

---

## 6.2 FRONTEND FILES

---

### 📄 `package.json` — Frontend Dependencies

```json
{
  "dependencies": {
    "react": "^18.2.0",           // UI library
    "react-dom": "^18.2.0",       // React for web browsers
    "react-router-dom": "^6.21.0", // Page navigation
    "axios": "^1.6.2",            // HTTP client (calls backend)
    "tailwindcss": "^3.4.0",      // CSS framework (utility classes)
    "postcss": "^8.4.32",         // CSS processor
    "autoprefixer": "^10.4.16"    // Adds browser prefixes to CSS
  }
}
```

---

### 📄 `vite.config.js` — Build Tool Configuration

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',  // Forward /api/* to backend
        changeOrigin: true
      }
    }
  }
})
```

**Proxy:** When frontend is on port 5173 and backend is on port 8080, browsers block cross-origin requests. Proxy makes it look like both are on the same server.

---

### 📄 `tailwind.config.js` — Tailwind CSS Configuration

```javascript
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: {} },
  plugins: [],
}
```

**content:** Tells Tailwind which files to scan for CSS class names. It finds classes like `bg-blue-600` and generates the corresponding CSS.

---

### 📄 `postcss.config.js` — PostCSS Configuration

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

PostCSS processes your CSS. Tailwind is a plugin. Autoprefixer adds `-webkit-`, `-moz-` prefixes automatically.

---

### 📄 `index.html` — HTML Entry Point

```html
<div id="root"></div>
<script type="module" src="/src/main.jsx"></script>
```

The entire React app renders inside `<div id="root">`. `main.jsx` is the JavaScript entry point.

---

### 📄 `src/main.jsx` — React Entry Point

```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- `ReactDOM.createRoot()` — Creates a React root in the div
- `render()` — Renders the App component inside it
- `StrictMode` — Development helper that double-renders to catch bugs

---

### 📄 `src/index.css` — Global Styles + Tailwind

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

These three lines import all of Tailwind CSS. The rest are custom utility classes:

```css
.sidebar-link { @apply flex items-center gap-3 px-4 py-3 ... }
.btn-primary { @apply bg-blue-600 text-white hover:bg-blue-700; }
.input { @apply w-full px-3 py-2 border border-gray-300 rounded-lg ... }
.card { @apply bg-white rounded-lg shadow-md p-6; }
.table th { @apply px-4 py-3 bg-gray-50 text-gray-600 font-semibold text-sm; }
.badge { @apply px-2 py-1 rounded-full text-xs font-medium; }
.badge-blue { @apply bg-blue-100 text-blue-800; }
```

**Tailwind vs traditional CSS:** Instead of writing separate CSS files and inventing class names, Tailwind provides tiny utility classes like `bg-blue-600`, `text-white`, `p-4`. You compose them directly in HTML/JSX.

---

### 📄 `src/App.jsx` — Routes Configuration

```jsx
function App() {
  return (
    <AuthProvider>                    {/* Provides login state to all components */}
      <BrowserRouter>                {/* Enables URL-based navigation */}
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="teams" element={<Teams />} />
            ...more routes...
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
```

**Route nesting:** The `/` route wraps all pages inside `Layout` (sidebar + header). So Dashboard, Users, Teams all share the same layout. Login has NO layout.

---

### 📄 `src/services/api.js` — ALL Backend Communication

**Purpose:** Central place for ALL API calls. Every page imports functions from here.

**Axios instance:**
```javascript
const api = axios.create({
  baseURL: '/api',           // All URLs start with /api (proxied to localhost:8080)
  headers: { 'Content-Type': 'application/json' }
})
```

**Request Interceptor (adds JWT token):**
```javascript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')  // Get token from browser storage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`  // Add to header
  }
  return config
})
```

**Response Interceptor (handles 401):**
```javascript
api.interceptors.response.use(
  (response) => response,  // Success: pass through
  (error) => {
    if (error.response?.status === 401) {  // Unauthorized
      localStorage.removeItem('token')     // Clear stored data
      localStorage.removeItem('user')
      window.location.href = '/login'      // Redirect to login
    }
    return Promise.reject(error)
  }
)
```

**Service objects exported:**
```javascript
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  createUser: (data) => api.post('/auth/create-user', data),
  getCurrentUser: () => api.get('/auth/me'),
  changePassword: (data) => api.post('/auth/change-password', data)
}

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  resetPassword: (id) => api.post(`/users/${id}/reset-password`),
  ...
}
```

**Why localStorage?** When user logs in, the JWT token is stored in the browser's localStorage. Even if user refreshes the page or closes and reopens the browser, the token persists. The `AuthContext` checks localStorage on page load to restore login state.

---

### 📄 `src/context/AuthContext.jsx` — Login State Management

**Purpose:** Makes login state available to EVERY component.

```jsx
// 1. Create a Context (a shared box)
const AuthContext = createContext(null)

// 2. Provider component (wraps entire app)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // On page load, check if token exists in localStorage
  useEffect(() => {
    const token = localStorage.getItem('token')
    const storedUser = localStorage.getItem('user')
    if (token && storedUser) {
      setUser(JSON.parse(storedUser))  // Restore user from localStorage
    }
    setLoading(false)
  }, [])

  // Login function
  const login = async (username, password) => {
    const response = await authService.login({ username, password })
    const { token, ...userData } = response.data
    localStorage.setItem('token', token)        // Save token
    localStorage.setItem('user', JSON.stringify(userData))  // Save user
    setUser(userData)                           // Update state
    return userData
  }

  // Logout function
  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  // Provide these to all children
  return (
    <AuthContext.Provider value={{ user, login, logout, loading, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  )
}

// 3. Custom hook to use auth from any component
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
```

**Pattern explained:**
1. `createContext` — Creates a shared storage
2. `Provider` — Wraps the app and stores the data
3. `useContext` / `useAuth()` — Any component can access auth data

**Why Context instead of props?** Without Context, you'd have to pass `user` from App → Layout → Sidebar → every page. That's called "prop drilling" and it's messy. Context lets any component directly access auth state.

---

### 📄 `src/components/ProtectedRoute.jsx` — Route Guard

```jsx
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()

  if (loading) return <div className="...">Loading...</div>  // Show loading
  if (!isAuthenticated) return <Navigate to="/login" replace />  // Redirect

  return children  // Show the page
}
```

**What it does:** Wraps all routes that need login. If user is not logged in, redirect to `/login`.

---

### 📄 `src/components/Layout.jsx` — Sidebar + Header

**Purpose:** Provides the application shell (sidebar navigation + top header) that wraps all pages.

**Sidebar Navigation:**
```jsx
const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: '📊', show: true },
  { path: '/tasks', label: 'Tasks', icon: '✅', show: true },
  { path: '/users', label: 'Users', icon: '👤', show: isManager || isTeamLead },
  ...
]
```

**Role-based visibility:**
- `isManager = ['SUPER_ADMIN', 'MANAGER'].includes(user?.role)`
- `isTeamLead = user?.role === 'TEAM_LEAD'`
- Users link only shows for managers and team leads
- Shifts link hides for team leads

**Password Modal:**
- Shown when user clicks "Change Password" button
- If `firstLogin` is true, the button is also shown prominently

**Layout Composition:**
```jsx
<div className="flex h-screen">  // Full viewport height, flex row
  <aside className="w-64 bg-gray-900">  // Sidebar (fixed width)
    ...nav items...
  </aside>
  <main className="flex-1 overflow-auto">  // Main content (takes remaining space)
    <header>...</header>
    <div className="p-6">
      <Outlet />  {/* Child route renders here */}
    </div>
  </main>
</div>
```

**Outlet:** Placeholder where child routes (Dashboard, Users, etc.) render. This is a React Router concept.

---

### 📄 `src/pages/Login.jsx` — Login Page

**Flow:**
1. User types username and password
2. Clicks Sign In
3. `handleSubmit` calls `login()` from AuthContext
4. AuthContext calls `authService.login()` (Axios POST to `/api/auth/login`)
5. Backend validates credentials, returns JWT token
6. AuthContext stores token in localStorage
7. User is redirected to `/dashboard`

**State variables:**
```javascript
const [username, setUsername] = useState('')  // Controlled input
const [password, setPassword] = useState('')
const [error, setError] = useState('')         // Error message
const [loading, setLoading] = useState(false)   // Loading state
```

**Error handling:**
```javascript
try {
  await login(username, password)
  navigate('/dashboard')
} catch (err) {
  setError(err.response?.data?.message || 'Invalid username or password')
}
```

---

### 📄 `src/pages/Dashboard.jsx` — Dashboard Page

**Purpose:** Shows an overview of task statistics.

**Data loaded on mount:**
```javascript
useEffect(() => { loadDashboard() }, [])

const loadDashboard = async () => {
  const response = await dashboardService.getData()
  setData(response.data)
}
```

**Displayed stats:**
- Total Tasks, Pending, Completed, Overdue, Blocked
- Completed Today, Pending Checklist Items, Delayed Checklists
- Recent Tasks (last 5)
- Pending Handovers (for user's shift)
- Pending Checklist Items

**Role-based sections:** Managers see "Pending Approvals" and "Missed Handovers" cards.

---

### 📄 `src/pages/Users.jsx` — Users Page

**Flow:**
1. Load users, teams, shifts on mount
2. Display users in a table
3. SUPER_ADMIN, MANAGER, TEAM_LEAD can see the Users page
4. Buttons: Add User, Edit, Reset Password

**Create User Form:**
- Sends `POST /api/auth/create-user` via `authService.createUser()`
- Converts empty `teamId` to `null` (prevents backend parsing errors)
- Shows error banner if backend returns error

**Edit User Form:**
- Sends `PUT /api/users/{id}` via `userService.update()`
- Same empty-to-null conversion

**Access control:**
```jsx
const isManager = ['SUPER_ADMIN', 'MANAGER', 'TEAM_LEAD'].includes(currentUser?.role)
if (!isManager) return <div className="card">Access Restricted...</div>
```

---

### 📄 `src/pages/Teams.jsx` — Teams Page

**Flow:**
1. Load teams, projects, users on mount
2. Display teams as cards in a grid
3. Only SUPER_ADMIN and MANAGER can create/edit/delete teams

**Team Form Features:**
- Manager dropdown (shows only users with MANAGER role)
- Team Lead dropdown (shows only users with TEAM_LEAD role)
- Members checkboxes (shows only STAFF, DEVELOPER, TESTER users)
- Selected manager and team lead are filtered out from member options
- Frontend ensures manager/team lead not duplicated in members

```javascript
const managers = users.filter(u => u.role === 'MANAGER')
const teamLeads = users.filter(u => u.role === 'TEAM_LEAD')
const memberPool = users.filter(u => ['STAFF', 'DEVELOPER', 'TESTER'].includes(u.role))
```

---

### 📄 `src/pages/Projects.jsx` — Projects Page

**Flow:**
1. Load projects on mount
2. Display as cards
3. SUPER_ADMIN/MANAGER can create/edit/delete

**Date validation (frontend):**
```javascript
const validateDates = () => {
  if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
    setError('End date must be after start date')
    return false
  }
  return true
}
```

HTML5 date inputs with `min`/`max` attributes to prevent invalid date selection.

---

### 📄 `src/pages/Tasks.jsx` — Tasks Page

**Flow:**
1. Load tasks, projects, teams, users on mount
2. Display in table
3. SUPER_ADMIN, MANAGER, TEAM_LEAD can create/edit/delete

**Task form fields:**
- Title (required), Description
- Status (TODO, IN_PROGRESS, IN_REVIEW, TESTING, COMPLETED, BLOCKED)
- Priority (LOW, MEDIUM, HIGH)
- Project, Team, Assigned To (dropdowns)
- Due Date

**Status color mapping:**
```javascript
function getStatusColor(status) {
  const colors = {
    TODO: 'blue', IN_PROGRESS: 'yellow', IN_REVIEW: 'purple',
    TESTING: 'orange', COMPLETED: 'green', BLOCKED: 'red'
  }
  return colors[status] || 'gray'
}
```

---

### 📄 `src/pages/Shifts.jsx` — Shifts Page

**Flow:**
1. Load shifts and teams
2. Display as cards in grid
3. SUPER_ADMIN/MANAGER can create/edit/delete

**Time validation:**
```javascript
if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
  setError('End time must be after start time')
  return false
}
```

---

### 📄 `src/pages/Checklists.jsx` — Checklists Page

**Flow:**
1. Load checklists, shifts, teams, users
2. Display checklists as cards with items
3. SUPER_ADMIN/MANAGER/TEAM_LEAD can create/delete
4. Any user can toggle item completion

**Checklist Card features:**
- Progress bar (percentage of items completed)
- Assigned users shown as compact badges
- Each item shows assigned person
- Checkbox to mark item complete/incomplete

**Creating a checklist:**
- Add items one by one with title and assignee
- Items are collected in an array before submitting
- Sent as part of `CreateChecklistRequest` to backend

---

### 📄 `src/pages/Handovers.jsx` — Handovers Page

**Flow:**
1. Load handovers, shifts, teams
2. Display as cards
3. Any authenticated user can create handovers
4. SUPER_ADMIN/MANAGER can delete

**Handover features:**
- View handover details in modal
- Mark as resolved, acknowledge receipt
- Priority badges (LOW=green, MEDIUM=yellow, HIGH=orange, CRITICAL=red)
- Shows from-shift → to-shift, assigned team → receiving team

---

# 7. COMPLETE FLOW EXPLANATIONS

---

## 7.1 LOGIN FLOW

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐     ┌──────────┐
│  Login.jsx  │────▶│  api.js      │────▶│ AuthController  │────▶│  auth    │
│  (Frontend) │     │  (Axios)     │     │  (Backend)      │     │ Service  │
└─────────────┘     └──────────────┘     └─────────────────┘     └──────────┘
                                                                       │
                                                                       ▼
                                                               ┌──────────────────┐
                                                               │ Authentication   │
                                                               │ Manager          │
                                                               └──────────────────┘
                                                                       │
                                                               ┌───────┴────────┐
                                                               ▼                ▼
                                                       ┌────────────┐  ┌──────────────┐
                                                       │ CustomUser │  │ BCrypt       │
                                                       │ Details    │  │ Password     │
                                                       │ Service    │  │ Encoder      │
                                                       └────────────┘  └──────────────┘
                                                               │
                                                               ▼
                                                       ┌──────────────────┐
                                                       │ JwtTokenProvider │
                                                       │ (generates JWT) │
                                                       └──────────────────┘
                                                               │
                                                               ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│  Login.jsx  │◀────│  api.js      │◀────│ AuthController  │
│  Stores in  │     │  Returns JSON│     │ Returns JWT     │
│  localStorage│    └──────────────┘     └─────────────────┘
└─────────────┘
       │
       ▼
┌────────────────┐
│ AuthContext    │
│ - setUser()   │
│ - save token   │
│   to localStorage│
└────────────────┘
       │
       ▼
┌──────────────────┐
│ Navigate to      │
│ /dashboard       │
└──────────────────┘
```

**Step-by-step:**
1. User enters username/password in Login.jsx
2. Login.jsx calls `login()` from AuthContext
3. AuthContext calls `authService.login()` which uses Axios
4. Axios sends POST request to `/api/auth/login`
5. Vite's dev server proxies to backend `localhost:8080/api/auth/login`
6. `AuthController.login()` receives the request
7. Calls `authService.login(LoginRequest)`
8. AuthService looks up user in database by username
9. AuthService calls `authenticationManager.authenticate()`
10. AuthenticationManager calls `CustomUserDetailsService.loadUserByUsername()`
11. UserDetailsService fetches user from database
12. AuthenticationManager compares password using BCrypt
13. If passwords match, `JwtTokenProvider.generateToken()` creates a JWT
14. JWT contains: username, issue date, expiry (24 hours), signed with secret key
15. Backend returns `LoginResponse` with token and user data
16. Axios receives the response
17. AuthContext stores token and user in localStorage
18. AuthContext sets `user` state (React re-renders)
19. Login.jsx navigates to `/dashboard`
20. Dashboard loads: `useAuth()` returns the logged-in user

---

## 7.2 USER CREATION FLOW

```
┌────────────┐     ┌──────────┐     ┌──────────────┐     ┌────────────┐     ┌──────────┐
│ Users.jsx  │────▶│ api.js   │────▶│ AuthController│────▶│ AuthService │────▶│   DB     │
│ (Frontend) │     │ (Axios)  │     │ /create-user  │     │ createUser()│     │  users   │
└────────────┘     └──────────┘     └──────────────┘     └────────────┘     └──────────┘
                                                                                 │
                                                                        ┌────────┴────────┐
                                                                        │                 │
                                                                   ┌─────────┐     ┌──────────┐
                                                                   │ username │     │  email   │
                                                                   │ unique?  │     │  unique? │
                                                                   └─────────┘     └──────────┘
                                                                        │                 │
                                                                        └────────┬────────┘
                                                                                 │
                                                                        ┌────────┴────────┐
                                                                        │  Password       │
                                                                        │  BCrypt encoded │
                                                                        └─────────────────┘
                                                                                 │
                                                                        ┌────────┴────────┐
                                                                        │  userRepository │
                                                                        │  .save(user)    │
                                                                        └─────────────────┘
```

**Step-by-step:**
1. Admin opens Users page, clicks "Add User"
2. Modal form appears with: username, password, first name, last name, email, phone, role, team
3. Admin fills form and clicks "Create"
4. Frontend converts empty `teamId` to `null`
5. `authService.createUser(payload)` sends POST request
6. Backend checks: `@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")`
7. If current user is not SUPER_ADMIN or MANAGER → 403 Forbidden
8. AuthController calls `authService.createUser(request, currentUser)`
9. AuthService checks: `userRepository.existsByUsername()` → if yes, throw error
10. AuthService checks: `userRepository.existsByEmail()` → if yes, throw error
11. Creates new User object, sets all fields
12. Encodes password with `passwordEncoder.encode()`
13. Saves user with `userRepository.save(user)` — status defaults to "ACTIVE"
14. Logs audit: "USER_CREATED"
15. Returns "User created successfully"
16. Frontend hides modal, reloads user list

---

## 7.3 TASK CREATION FLOW

```
┌──────────┐     ┌──────────┐     ┌──────────────┐     ┌────────────┐     ┌──────┐
│ Tasks.jsx│────▶│ api.js   │────▶│TaskController │────▶│TaskService  │────▶│  DB  │
│ (Form)   │     │ (Axios)  │     │ POST /tasks   │     │ createTask()│     │ tasks│
└──────────┘     └──────────┘     └──────────────┘     └────────────┘     └──────┘
                                                                              │
                                                                     ┌────────┴────────┐
                                                                     │  Validate:       │
                                                                     │  - project exists │
                                                                     │  - team exists    │
                                                                     │  - assigned user  │
                                                                     │    exists         │
                                                                     └─────────────────┘
                                                                              │
                                                                     ┌────────┴────────┐
                                                                     │  Create Task     │
                                                                     │  entity, set     │
                                                                     │  all fields      │
                                                                     └─────────────────┘
                                                                              │
                                                                     ┌────────┴────────┐
                                                                     │  taskRepository  │
                                                                     │  .save(task)     │
                                                                     └─────────────────┘
```

---

## 7.4 TEAM CREATION FLOW

```
┌──────────┐     ┌──────────┐     ┌──────────────┐     ┌────────────┐     ┌──────┐
│ Teams.jsx│────▶│ api.js   │────▶│TeamController │────▶│TeamService  │────▶│  DB  │
│ (Form)   │     │ (Axios)  │     │ POST /teams   │     │ createTeam()│     │ teams│
└──────────┘     └──────────┘     └──────────────┘     └────────────┘     └──────┘
                                                              │
                                                     ┌────────┴────────┐
                                                     │  validateTeam   │
                                                     │  Assignment()   │
                                                     │  - manager ≠    │
                                                     │    team lead    │
                                                     │  - manager not  │
                                                     │    in members   │
                                                     │  - team lead not│
                                                     │    in members   │
                                                     └─────────────────┘
                                                              │
                                                     ┌────────┴────────┐
                                                     │  save team      │
                                                     │  assign members │
                                                     │  (update user   │
                                                     │   team_id)      │
                                                     └─────────────────┘
```

**Key validation:**
- Frontend filters: Manager dropdown only shows MANAGER role users
- Team Lead dropdown only shows TEAM_LEAD role users
- Members only shows STAFF/DEVELOPER/TESTER users
- Selected manager/lead are hidden from member checkboxes
- Backend double-checks the same validation

---

## 7.5 CHECKLIST FLOW

```
┌──────────────┐     ┌──────────┐     ┌──────────────────┐     ┌───────────────┐
│ Checklists   │────▶│ api.js   │────▶│ChecklistController│────▶│ChecklistService│
│ .jsx (Form)  │     │ (Axios)  │     │ POST /checklists  │     │ createChecklist│
└──────────────┘     └──────────┘     └──────────────────┘     └───────────────┘
                                                                         │
                                                                ┌────────┴────────┐
                                                                │  Create Checklist│
                                                                │  entity          │
                                                                │  Set title, shift│
                                                                │  team, creator   │
                                                                └─────────────────┘
                                                                         │
                                                                ┌────────┴────────┐
                                                                │  For each item:  │
                                                                │  Create          │
                                                                │  ChecklistItem   │
                                                                │  entity          │
                                                                │  Add to list     │
                                                                └─────────────────┘
                                                                         │
                                                                ┌────────┴────────┐
                                                                │  checklist      │
                                                                │  .getItems()     │
                                                                │  .addAll(items)  │
                                                                └─────────────────┘
                                                                         │
                                                                ┌────────┴────────┐
                                                                │  checklist      │
                                                                │  Repository     │
                                                                │  .save()        │
                                                                └─────────────────┘
```

**Why `addAll()` instead of `setItems()`?** Hibernate tracks collections using a special PersistentBag. If you replace the list with `setItems()`, Hibernate doesn't know which items are new or removed. `addAll()` adds to the existing tracked collection.

---

## 7.6 DASHBOARD FLOW

```
┌──────────────┐     ┌──────────┐     ┌──────────────────┐     ┌────────────────┐
│ Dashboard    │────▶│ api.js   │────▶│DashboardController│────▶│DashboardService│
│ .jsx         │     │ (Axios)  │     │ GET /dashboard    │     │ getDashboard   │
└──────────────┘     └──────────┘     └──────────────────┘     └────────────────┘
                                                                         │
                                                                ┌────────┴────────┐
                                                                │  Determine user │
                                                                │  role & scope   │
                                                                └─────────────────┘
                                                                         │
                                                    ┌────────────────────┐┐
                                                    │  If manager:       ││
                                                    │  all tasks         ││
                                                    │  If has team:      ││
                                                    │  team tasks + own  ││
                                                    │  If no team:       ││
                                                    │  own tasks only    ││
                                                    └────────────────────┘┘
                                                                         │
                                                    ┌────────────────────┐┐
                                                    │  Count: total,     ││
                                                    │  pending,          ││
                                                    │  completed,        ││
                                                    │  overdue, blocked  ││
                                                    │  completed today   ││
                                                    └────────────────────┘┘
                                                                         │
                                                    ┌────────────────────┐┐
                                                    │  Recent tasks      ││
                                                    │  (last 10 updated) ││
                                                    │  Pending handovers ││
                                                    │  (unresolved for   ││
                                                    │   user's shift)    ││
                                                    │  Pending checklist ││
                                                    │  items (for user's ││
                                                    │   shift)           ││
                                                    └────────────────────┘┘
```

---

# 8. CONCEPT LIBRARY

---

## 8.1 JWT (JSON Web Token)

**What it is:** A string of text that proves a user is logged in.

**Format:** `xxxxx.yyyyy.zzzzz` (three parts separated by dots)

- **Header:** `{"alg": "HS256"}` — How the token is signed
- **Payload:** `{"sub": "admin", "iat": 123, "exp": 456}` — The data (username, times)
- **Signature:** Encrypted using secret key — prevents tampering

**Why it's used here:** The server doesn't need to remember who's logged in (no session). The client sends the JWT with every request. The server just validates the signature.

**Where:** JwtTokenProvider generates it, JwtAuthenticationFilter validates it.

---

## 8.2 REST API

**What it is:** A way for frontend and backend to communicate over HTTP.

**Principles:**
- Each URL represents a "resource": `/api/users`, `/api/tasks`
- HTTP methods represent actions: GET (read), POST (create), PUT (update), DELETE (delete)
- Data is sent as JSON

**Example:**
```
GET /api/users        → Get all users
POST /api/users       → Create a user (send JSON body)
PUT /api/users/5      → Update user with id 5
DELETE /api/users/5   → Delete user with id 5
```

---

## 8.3 Axios

**What it is:** A JavaScript library for making HTTP requests.

**Instead of:** The browser's built-in `fetch()` API.

**Why Axios?**
- Automatically parses JSON responses
- Supports request/response interceptors (add JWT token automatically)
- Better error handling
- Cleaner syntax

**Where used:** `frontend/src/services/api.js` — all API calls go through Axios instances.

---

## 8.4 useState and useEffect

**useState:** Stores data that changes over time.
```javascript
const [users, setUsers] = useState([])    // Start with empty array
const [loading, setLoading] = useState(true)  // Start with true
// Later:
setUsers(response.data)  // Update users → React re-renders
setLoading(false)         // Hide loading spinner
```

**useEffect:** Runs code when component mounts or when dependencies change.
```javascript
useEffect(() => {
  loadData()  // Fetch data from backend when component first appears
}, [])        // Empty array = run only once (on mount)
```

**Why they're used together:** useEffect fetches data from backend, then useState stores it. React automatically updates the UI when state changes.

---

## 8.5 Props

**What it is:** Short for "properties". Data passed from a parent component to a child component.

```jsx
// Parent passes props
<UserCard name="John" role="MANAGER" />

// Child receives props
function UserCard({ name, role }) {
  return <div>{name} - {role}</div>
}
```

**Direction:** Props flow ONE way: parent → child. Child cannot change props.

---

## 8.6 Context API

**What it is:** A way to share data across the entire component tree without passing props manually.

**Problem it solves:** Without Context, if Component A at the top needs data for Component Z deep in the tree, every component in between needs to pass it as props (prop drilling).

**Where used:** `AuthContext.jsx` — makes user login state available to every component.

---

## 8.7 Dependency Injection (Spring)

**What it is:** Instead of creating objects manually with `new`, Spring creates them and "injects" them where needed.

**Without DI:**
```java
public class UserService {
    private UserRepository userRepository = new UserRepository();  // Hard-coded
}
```

**With DI:**
```java
public class UserService {
    private final UserRepository userRepository;  // Spring provides this
    
    public UserService(UserRepository userRepository) {  // Constructor injection
        this.userRepository = userRepository;
    }
}
```

**Why better:** You can swap implementations (e.g., test with a fake repository). Also, Spring manages the lifecycle.

---

## 8.8 JPA / Hibernate

**What it is:** JPA (Java Persistence API) is a specification for mapping Java objects to database tables. Hibernate is the implementation.

**What it does:**
- Automatically creates tables based on `@Entity` classes
- Converts Java method calls to SQL queries
- Example: `userRepository.save(user)` → `INSERT INTO users (...) VALUES (...)`

**Key annotations:**
- `@Entity` — This class is a database table
- `@Table(name = "users")` — Table name
- `@Id` — Primary key
- `@GeneratedValue` — Auto-increment
- `@Column` — Column settings (nullable, unique)
- `@ManyToOne` / `@OneToMany` — Relationships

---

## 8.9 BCrypt

**What it is:** A password hashing algorithm.

**Why not store plain text passwords?** If the database is hacked, all passwords are exposed.

**How BCrypt works:**
1. Takes password + random "salt" → generates hash
2. Hash is one-way: you cannot reverse it to get the original password
3. When logging in: BCrypt hashes the entered password (with the stored salt) and compares

**Where used:** `SecurityConfig.java` creates `BCryptPasswordEncoder`. AuthService uses it when saving and verifying passwords.

---

## 8.10 Spring Security & Role-Based Access

**What it does:** Controls who can access what parts of the application.

**Annotations:**
```java
@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
```

This annotation checks: Does the logged-in user have ROLE_SUPER_ADMIN or ROLE_MANAGER?

**Roles defined:** SUPER_ADMIN > MANAGER > TEAM_LEAD > DEVELOPER/TESTER/STAFF

**Access matrix (simplified):**

| Feature | SUPER_ADMIN | MANAGER | TEAM_LEAD | STAFF |
|---------|-------------|---------|-----------|-------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| Manage Users | ✅ | ✅ | ❌ | ❌ |
| Create User | ✅ | ✅ | ❌ | ❌ |
| Create Team | ✅ | ✅ | ❌ | ❌ |
| Delete Team | ✅ | ❌ | ❌ | ❌ |
| Create Task | ✅ | ✅ | ✅ | ❌ |
| View Checklists | ✅ | ✅ | ✅ | ✅ |
| Create Checklist | ✅ | ✅ | ✅ | ❌ |

---

## 8.11 React Router

**What it is:** Library for navigation between pages in a React app.

**Key components:**
- `BrowserRouter` — Enables URL-based routing
- `Routes` / `Route` — Define paths and which component to render
- `NavLink` — Creates navigation links (highlights active link)
- `Navigate` — Redirects to another page
- `Outlet` — Placeholder for nested routes

**Where used:** `App.jsx` defines all routes. `Layout.jsx` uses `Outlet` for page content.

---

## 8.12 Validation

**Backend validation (Spring Validation):**
```java
@NotBlank(message = "Username is required")
private String username;
```
Spring automatically checks this before the method runs. If invalid, returns 400 with error message.

**Frontend validation:**
```javascript
// Required attribute on input
<input type="text" required />

// Custom validation
if (formData.newPassword !== formData.confirmPassword) {
  setError('New passwords do not match')
  return
}

// HTML5 constraint attributes
<input type="date" max={formData.endDate || undefined} />
<input type="date" min={formData.startDate || undefined} />
```

---

## 8.13 Exception Handling

**What it is:** A way to handle errors gracefully instead of crashing.

**Backend:** `GlobalExceptionHandler.java` catches exceptions and returns JSON errors.

**Frontend:** Try-catch blocks around API calls:
```javascript
try {
  await teamService.create(data)
  // Success: close modal, reload data
} catch (err) {
  setError(err.response?.data?.message || 'Failed to save')
  // Error: show error message in form
}
```

---

# 9. INTERVIEW/VIVA PREPARATION

---

## 9.1 Common Interview Questions & Answers

### Q: Explain this project in 30 seconds.
**A:** "This is a full-stack workflow management system for retail stores. It manages teams, shifts, tasks, checklists, and shift handovers. The backend is Spring Boot with JWT authentication and PostgreSQL. The frontend is React with Tailwind CSS. Users have different roles like admin, manager, team lead, and staff, each with different permissions."

### Q: How does authentication work?
**A:** "Users log in with username and password. The backend verifies credentials using Spring Security and BCrypt password hashing. If valid, it generates a JWT token signed with a secret key. The frontend stores this token in localStorage and sends it with every request in the Authorization header. A custom JWT filter intercepts each request, validates the token, and sets the authentication context."

### Q: What is JWT and why use it instead of sessions?
**A:** "JWT stands for JSON Web Token. It's a self-contained token that stores user information. We use it instead of sessions because REST APIs should be stateless — meaning the server doesn't store session data. With JWT, the token itself contains all the information needed. This makes the application scalable because any server instance can verify the token without shared session storage."

### Q: Explain the layered architecture.
**A:** "The backend follows a layered architecture: Controller (handles HTTP requests), Service (business logic), Repository (database access), Entity (database models). This separation of concerns makes the code maintainable and testable. Each layer has a specific responsibility and communicates only with the layer below it."

### Q: What are DTOs and why are they needed?
**A:** "DTO stands for Data Transfer Object. They are simple objects that carry data between frontend and backend. We need them because we should not expose our entity objects directly. For example, the User entity has a password field that should never be sent to the frontend. DTOs let us control exactly what data is exposed."

### Q: How does role-based access control work?
**A:** "We use Spring Security's @PreAuthorize annotation on controller methods. For example, `@PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")` ensures only admins and managers can access that endpoint. The JWT token contains the user's role, and Spring Security checks it against the required roles. On the frontend, we also conditionally show/hide buttons based on the user's role."

### Q: Explain the relationship between entities.
**A:** "A Project has many Teams (OneToMany), a Team has many Users (OneToMany), a User belongs to one Team (ManyToOne). Tasks belong to both a Project and a Team. Checklists belong to a Shift and a Team, and have many ChecklistItems. Handovers connect two shifts and two teams."

### Q: How do you handle errors?
**A:** "On the backend, we have a GlobalExceptionHandler class with @RestControllerAdvice that catches all exceptions. It returns consistent JSON error responses like `{message: 'Username already exists', status: 409}`. On the frontend, we use try-catch blocks around all API calls and display error messages in banners."

### Q: What is the dashboard doing?
**A:** "The dashboard aggregates data from multiple tables. It counts total, pending, completed, overdue, and blocked tasks. It also shows recent tasks, pending handovers for the user's shift, and pending checklist items. For managers, it additionally shows pending approvals and missed handovers."

### Q: How does the frontend communicate with backend?
**A:** "We use Axios as our HTTP client. We create a single Axios instance with interceptors that automatically add the JWT token to every request. The Vite dev server proxies /api requests to the Spring Boot backend running on port 8080. Each page calls service functions from api.js, which return promises. We use async/await to handle the responses."

---

## 9.2 How to Explain This Project Confidently

**Start with the big picture:**
> "This is a store operations management system I built. It helps retail stores manage their daily operations — tasks, teams, shifts, checklists, and shift handovers."

**Describe architecture briefly:**
> "It uses a modern stack: Spring Boot backend with layered architecture (controllers, services, repositories), React frontend with components and Context API, and PostgreSQL database."

**Highlight security:**
> "Authentication uses JWT tokens with BCrypt password encryption. Authorization is role-based — we have SUPER_ADMIN, MANAGER, TEAM_LEAD, and STAFF roles with different permissions."

**Give a concrete example:**
> "For example, when a manager creates a task for a developer, the frontend sends a POST request to /api/tasks with the task details. The backend checks if the user has MANAGER or TEAM_LEAD role, validates the data, creates the Task entity, saves it to the database, logs the action in audit logs, and returns the created task. The frontend then refreshes the task list."

**Be prepared for follow-ups:**
- "How would you add a new feature?" — Add entity, repository, service, controller, DTO, frontend page
- "How would you handle performance?" — Add pagination, use LAZY fetching, add database indexes
- "How would you deploy?" — Build JAR for backend, build dist folder for frontend, run with PostgreSQL

---

## 9.3 Key Technical Terms to Know

| Term | Simple Explanation |
|------|-------------------|
| **REST API** | URLs that represent resources, using HTTP methods |
| **JWT** | A token that proves identity, stored in browser |
| **CRUD** | Create, Read, Update, Delete — the four basic operations |
| **DTO** | Object that carries data between frontend and backend (no passwords) |
| **Entity** | Java class that maps to a database table |
| **Repository** | Interface that provides database operations |
| **Service** | Class containing business logic |
| **Controller** | Class handling HTTP requests |
| **Dependency Injection** | Spring automatically provides dependencies |
| **JPA/Hibernate** | Maps Java objects to database tables |
| **BCrypt** | Algorithm that securely hashes passwords |
| **CORS** | Browser security that blocks cross-origin requests (we use proxy) |
| **Axios** | JavaScript library for making HTTP requests |
| **useState** | React hook that stores changing data |
| **useEffect** | React hook that runs code on component mount |
| **Context API** | React feature for sharing state across components |
| **Tailwind CSS** | Utility-first CSS framework (small classes compose styles) |
| **Vite** | Fast build tool for modern web apps |

---

## 9.4 Potential Enhancements (If Asked)

**What would you add if you had more time?**
- Pagination for large lists
- Email notifications for task assignments
- File uploads for task attachments
- WebSocket for real-time updates
- Dark mode toggle
- Mobile-responsive design improvements
- Unit and integration tests

---

*End of Document — Generated for Learning & Interview Preparation*
