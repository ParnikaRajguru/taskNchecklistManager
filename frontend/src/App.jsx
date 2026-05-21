import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'
import Teams from './pages/Teams'
import Projects from './pages/Projects'
import ProjectDetails from './pages/ProjectDetails'
import TeamWorkspace from './pages/TeamWorkspace'
import TaskDetails from './pages/TaskDetails'
import Tasks from './pages/Tasks'
import Shifts from './pages/Shifts'
import Checklists from './pages/Checklists'
import Handovers from './pages/Handovers'
import AuditLogs from './pages/AuditLogs'
import Layout from './components/Layout'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="teams" element={<Teams />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/:id" element={<ProjectDetails />} />
            <Route path="projects/:projectId/teams/:teamId" element={<TeamWorkspace />} />
            <Route path="projects/:projectId/teams/:teamId/tasks/:taskId" element={<TaskDetails />} />
            <Route path="tasks" element={<Tasks />} />
            <Route path="tasks/:taskId" element={<TaskDetails />} />
            <Route path="shifts" element={<Shifts />} />
            <Route path="checklists" element={<Checklists />} />
            <Route path="handovers" element={<Handovers />} />
            <Route path="audit-logs" element={<AuditLogs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App