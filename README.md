# Store Task & Checklist Manager

A full-stack internal workflow management system for teams, shift handovers, and task management.

## Tech Stack

**Backend:**
- Java 17
- Spring Boot 3.2
- Spring Security with JWT
- Spring Data JPA / Hibernate
- PostgreSQL

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- React Router
- Axios

---

## Prerequisites

1. **Java 17+** - Download from https://adoptium.net/
2. **PostgreSQL** - Download from https://www.postgresql.org/download/
3. **Node.js** - Download from https://nodejs.org/ (v18+ recommended)
4. **Maven** - Included with IntelliJ or install separately

---

## Database Setup

1. Install PostgreSQL
2. Open pgAdmin or command line
3. Create a new database:

```sql
CREATE DATABASE taskmanager;
```

4. Update `backend/src/main/resources/application.properties` if needed:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/taskmanager
spring.datasource.username=postgres
spring.datasource.password=postgres
```

> Note: Change `postgres` to your PostgreSQL username and password

---

## Running the Backend

### Option 1: Using IntelliJ IDEA

1. Open the `backend` folder in IntelliJ
2. Wait for Maven to download dependencies
3. Run `TaskManagerApplication.java`

### Option 2: Using Command Line

```cmd
cd backend
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`

---

## Running the Frontend

### Install Dependencies

```cmd
cd frontend
npm install
```

### Start Development Server

```cmd
npm run dev
```

The frontend will start on `http://localhost:5173`

---

## Default Login Credentials

The application automatically creates a default admin user on first run:

| Field     | Value      |
|-----------|------------|
| Username  | admin      |
| Password  | admin123   |

**First Login:** You will be prompted to change your password.

---

## Loading Sample Data (Optional)

The project includes sample data for demonstration purposes. After starting the backend:

### Option 1: Using pgAdmin

1. Open pgAdmin and connect to your database
2. Right-click on `taskmanager` database
3. Select "Query Tool"
4. Open and execute `database/sample-data.sql`

### Option 2: Using Command Line

```cmd
psql -U postgres -d taskmanager -f database/sample-data.sql
```

Replace `postgres` with your username if different.

### Option 3: Using Batch File (Windows)

```cmd
database\load-sample-data.bat
```

### Sample Users Created

| Username      | Password     | Role        |
|---------------|--------------|-------------|
| admin         | admin123     | SUPER_ADMIN |
| john.manager  | password123  | MANAGER     |
| sarah.lead    | password123  | TEAM_LEAD   |
| mike.dev      | password123  | DEVELOPER   |
| emily.tester  | password123  | TESTER      |
| alex.dev      | password123  | DEVELOPER   |
| lisa.tester   | password123  | TESTER      |
| david.dev     | password123  | DEVELOPER   |
| jenny.lead    | password123  | TEAM_LEAD   |

### Sample Data Includes

- **5 Projects** - Various statuses (Active, Planning, On Hold)
- **6 Teams** - Assigned to different projects
- **21 Tasks** - Different statuses, priorities, and assignments
- **4 Checklists** - Morning and evening shifts for store and warehouse
- **20 Checklist Items** - Various completion states
- **4 Handovers** - Sample shift handover reports
- **Notes & Audit Logs** - Sample activity records

---

## Creating Additional Users

1. Login as admin
2. Navigate to **Users** page
3. Click **Add User**
4. Fill in the details and select a role:
   - `SUPER_ADMIN` - Full access
   - `PROJECT_MANAGER` - Manage projects and teams
   - `MANAGER` - Manage teams and users
   - `TEAM_LEAD` - Manage team tasks
   - `DEVELOPER` / `TESTER` - Regular users

---

## Project Structure

```
backend/
├── src/main/java/com/store/taskmanager/
│   ├── controller/     # REST API endpoints
│   ├── service/       # Business logic
│   ├── repository/    # Database access
│   ├── entity/        # JPA entities
│   ├── dto/           # Data transfer objects
│   ├── security/      # JWT authentication
│   └── config/        # Application configuration

frontend/
├── src/
│   ├── pages/         # Application pages
│   ├── components/    # Reusable components
│   ├── services/      # API service layer
│   └── context/       # React context (Auth)
```

---

## Available Pages

| Page          | Description                              |
|---------------|------------------------------------------|
| Dashboard     | Overview with task statistics            |
| Tasks         | Create and manage tasks                  |
| Projects      | Create and manage projects              |
| Teams         | Create and manage teams                 |
| Users         | Manage users and assignments            |
| Shifts        | Manage shift schedules                   |
| Checklists    | Create shift checklists                  |
| Handovers     | Create shift handover reports           |

---

## API Endpoints

**Authentication:**
- `POST /api/auth/login` - Login
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/create-user` - Create new user (admin only)
- `GET /api/auth/me` - Get current user

**Resources:**
- `/api/users` - User CRUD
- `/api/teams` - Team CRUD
- `/api/projects` - Project CRUD
- `/api/tasks` - Task CRUD
- `/api/shifts` - Shift CRUD
- `/api/checklists` - Checklist CRUD
- `/api/handovers` - Handover CRUD
- `/api/dashboard` - Dashboard data
- `/api/audit-logs` - Audit logs (admin only)

---

## Environment Variables

No additional environment variables required. All configuration is in `application.properties`.

---

## Troubleshooting

**Port already in use:**
- Backend default: 8080
- Frontend default: 5173

**Database connection error:**
- Verify PostgreSQL is running
- Check username/password in `application.properties`

**Maven build errors:**
- Ensure Java 17 is set as JAVA_HOME
- Run `mvn clean install` to refresh dependencies

---

## License

Internal use only - Store Operations Team