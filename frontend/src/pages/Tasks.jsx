import { useState, useEffect } from 'react'
import { taskService, projectService, teamService, userService, shiftService } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [teams, setTeams] = useState([])
  const [shifts, setShifts] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    projectId: '',
    teamId: '',
    shiftId: '',
    assignedToId: '',
    dueDate: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const tasksPromise = taskService.getAll()
      const projectsPromise = projectService.getAll()
      const teamsPromise = teamService.getAll()
      const shiftsPromise = shiftService.getAll()
      const usersPromise = userService.getAll().catch(() => ({ data: [] }))
      const [tasksRes, projectsRes, teamsRes, shiftsRes, usersRes] = await Promise.all([
        tasksPromise, projectsPromise, teamsPromise, shiftsPromise, usersPromise
      ])
      setTasks(tasksRes.data)
      setProjects(projectsRes.data)
      setTeams(teamsRes.data)
      setShifts(shiftsRes.data)
      setUsers(usersRes.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        projectId: formData.projectId || null,
        teamId: formData.teamId || null,
        assignedToId: formData.assignedToId || null,
        dueDate: formData.dueDate || null
      }
      
      if (editingTask) {
        await taskService.update(editingTask.id, data)
      } else {
        await taskService.create(data)
      }
      
      setShowModal(false)
      setEditingTask(null)
      resetForm()
      loadData()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save task')
    }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      projectId: task.projectId || '',
      teamId: task.teamId || '',
      shiftId: task.shiftId || '',
      assignedToId: task.assignedToId || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.delete(id)
        loadData()
      } catch (err) {
        alert('Failed to delete task')
      }
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      status: 'TODO',
      priority: 'MEDIUM',
      projectId: '',
      teamId: '',
      shiftId: '',
      assignedToId: '',
      dueDate: ''
    })
  }

  const isManager = ['SUPER_ADMIN', 'PROJECT_MANAGER', 'MANAGER', 'TEAM_LEAD'].includes(user?.role)

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Tasks</h1>
        {isManager && (
          <button
            onClick={() => { resetForm(); setEditingTask(null); setShowModal(true) }}
            className="btn btn-primary"
          >
            Add Task
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Project</th>
              <th>Team</th>
              <th>Shift</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Priority</th>
              <th>Checklists</th>
              <th>Due Date</th>
              {isManager && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {tasks.map((task) => (
              <tr key={task.id}>
                <td className="font-medium">{task.title}</td>
                <td>{task.projectName || '-'}</td>
                <td>{task.teamName || '-'}</td>
                <td>{task.shiftName || '-'}</td>
                <td>{task.assignedToName || '-'}</td>
                <td>
                  <span className={`badge badge-${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </td>
                <td>
                  <span className={`badge badge-${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </td>
                <td>{task.checklistCount || 0}</td>
                <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                {isManager && (
                  <td>
                    <button
                      onClick={() => handleEdit(task)}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(task.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editingTask ? 'Edit Task' : 'Create Task'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                placeholder="Title"
                className="input"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                className="input"
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="input"
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="TODO">Todo</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="IN_REVIEW">In Review</option>
                  <option value="TESTING">Testing</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="BLOCKED">Blocked</option>
                </select>
                <select
                  className="input"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="input"
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <select
                  className="input"
                  value={formData.teamId}
                  onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}
                >
                  <option value="">Select Team</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="input"
                  value={formData.shiftId}
                  onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}
                >
                  <option value="">Select Shift</option>
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
                <select
                  className="input"
                  value={formData.assignedToId}
                  onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                >
                  <option value="">Assign To</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="date"
                  className="input"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary flex-1">
                  {editingTask ? 'Update' : 'Create'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function getStatusColor(status) {
  const colors = {
    TODO: 'blue',
    IN_PROGRESS: 'yellow',
    IN_REVIEW: 'purple',
    TESTING: 'orange',
    COMPLETED: 'green',
    BLOCKED: 'red'
  }
  return colors[status] || 'gray'
}

function getPriorityColor(priority) {
  const colors = {
    LOW: 'gray',
    MEDIUM: 'blue',
    HIGH: 'red'
  }
  return colors[priority] || 'gray'
}