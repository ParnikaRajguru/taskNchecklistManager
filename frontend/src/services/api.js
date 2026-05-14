import axios from 'axios'

const API_URL = '/api'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  changePassword: (data) => api.post('/auth/change-password', data),
  createUser: (data) => api.post('/auth/create-user', data),
  getCurrentUser: () => api.get('/auth/me')
}

export const userService = {
  getAll: () => api.get('/users'),
  getById: (id) => api.get(`/users/${id}`),
  getByTeam: (teamId) => api.get(`/users/by-team/${teamId}`),
  getByRole: (role) => api.get(`/users/by-role/${role}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  resetPassword: (id) => api.post(`/users/${id}/reset-password`),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  changePassword: (data) => api.post('/users/change-password', data)
}

export const teamService = {
  getAll: () => api.get('/teams'),
  getById: (id) => api.get(`/teams/${id}`),
  getByProject: (projectId) => api.get(`/teams/by-project/${projectId}`),
  getMyTeam: () => api.get('/teams/my-team'),
  create: (data) => api.post('/teams', data),
  update: (id, data) => api.put(`/teams/${id}`, data),
  delete: (id) => api.delete(`/teams/${id}`)
}

export const projectService = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  getByStatus: (status) => api.get(`/projects/by-status/${status}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`)
}

export const taskService = {
  getAll: () => api.get('/tasks'),
  getById: (id) => api.get(`/tasks/${id}`),
  getByProject: (projectId) => api.get(`/tasks/by-project/${projectId}`),
  getByTeam: (teamId) => api.get(`/tasks/by-team/${teamId}`),
  getByUser: (userId) => api.get(`/tasks/by-user/${userId}`),
  getMyTasks: () => api.get('/tasks/my-tasks'),
  getMyPending: () => api.get('/tasks/my-pending'),
  getOverdue: () => api.get('/tasks/overdue'),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`)
}

export const shiftService = {
  getAll: () => api.get('/shifts'),
  getById: (id) => api.get(`/shifts/${id}`),
  getActive: () => api.get('/shifts/active'),
  create: (data) => api.post('/shifts', data),
  update: (id, data) => api.put(`/shifts/${id}`, data),
  delete: (id) => api.delete(`/shifts/${id}`)
}

export const checklistService = {
  getAll: () => api.get('/checklists'),
  getById: (id) => api.get(`/checklists/${id}`),
  getByShift: (shiftId) => api.get(`/checklists/by-shift/${shiftId}`),
  getByTeam: (teamId) => api.get(`/checklists/by-team/${teamId}`),
  create: (data) => api.post('/checklists', data),
  completeItem: (itemId) => api.put(`/checklists/items/${itemId}/complete`),
  uncompleteItem: (itemId) => api.put(`/checklists/items/${itemId}/uncomplete`),
  delete: (id) => api.delete(`/checklists/${id}`)
}

export const handoverService = {
  getAll: () => api.get('/handovers'),
  getById: (id) => api.get(`/handovers/${id}`),
  getByShift: (shiftId) => api.get(`/handovers/by-shift/${shiftId}`),
  getUnresolved: (shiftId) => api.get(`/handovers/unresolved/${shiftId}`),
  getByTeam: (teamId) => api.get(`/handovers/by-team/${teamId}`),
  getUnacknowledged: (teamId) => api.get(`/handovers/unacknowledged/${teamId}`),
  create: (data) => api.post('/handovers', data),
  resolve: (id) => api.put(`/handovers/${id}/resolve`),
  acknowledge: (id) => api.put(`/handovers/${id}/acknowledge`),
  delete: (id) => api.delete(`/handovers/${id}`)
}

export const noteService = {
  getByTask: (taskId) => api.get(`/notes/by-task/${taskId}`),
  getByChecklistItem: (itemId) => api.get(`/notes/by-checklist-item/${itemId}`),
  getByHandover: (handoverId) => api.get(`/notes/by-handover/${handoverId}`),
  create: (data) => api.post('/notes', data),
  delete: (id) => api.delete(`/notes/${id}`)
}

export const dashboardService = {
  getData: () => api.get('/dashboard')
}

export const auditService = {
  getAll: () => api.get('/audit-logs'),
  getRecent: (days) => api.get(`/audit-logs/recent?days=${days}`),
  getByUser: (userId) => api.get(`/audit-logs/by-user/${userId}`)
}

export default api
