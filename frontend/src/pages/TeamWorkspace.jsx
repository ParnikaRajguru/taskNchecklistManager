import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { taskService, projectService, teamService, userService } from '../services/api'
import { useAuth } from '../context/AuthContext'

const TASK_STATUSES = { CREATE: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'TESTING', 'BLOCKED'], EDIT: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'TESTING', 'BLOCKED', 'COMPLETED'] }

function getStatusColor(status) {
  const colors = { TODO: 'blue', IN_PROGRESS: 'yellow', IN_REVIEW: 'purple', TESTING: 'orange', COMPLETED: 'green', BLOCKED: 'red' }
  return colors[status] || 'gray'
}
function getStatusLabel(status) {
  const labels = { TODO: 'Todo', IN_PROGRESS: 'In Progress', IN_REVIEW: 'In Review', TESTING: 'Testing', COMPLETED: 'Completed', BLOCKED: 'Blocked' }
  return labels[status] || status
}

export default function TeamWorkspace() {
  const { projectId, teamId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [project, setProject] = useState(null)
  const [team, setTeam] = useState(null)
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', assignedToId: '', dueDate: '' })

  const isManager = ['SUPER_ADMIN', 'MANAGER', 'TEAM_LEAD'].includes(user?.role)

  useEffect(() => { loadData() }, [projectId, teamId])

  const loadData = async () => {
    try {
      const [projRes, teamRes, tasksRes, usersRes] = await Promise.all([
        projectService.getById(projectId),
        teamService.getById(teamId),
        taskService.getByTeamAndProject(teamId, projectId),
        userService.getByTeam(teamId)
      ])
      setProject(projRes.data)
      setTeam(teamRes.data)
      setTasks(tasksRes.data)
      setUsers(usersRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const getFilteredUsers = () => {
    if (!user) return []
    const selfId = user.id
    const role = user.role
    const isStaffLevel = (r) => ['STAFF', 'DEVELOPER', 'TESTER'].includes(r)
    if (role === 'SUPER_ADMIN') return users.filter(u => u.id !== selfId && u.teamId === Number(teamId))
    if (role === 'MANAGER') return users.filter(u => u.id !== selfId && u.role !== 'SUPER_ADMIN' && u.role !== 'MANAGER' && u.teamId === Number(teamId))
    if (role === 'TEAM_LEAD') return users.filter(u => u.id !== selfId && isStaffLevel(u.role) && u.teamId === Number(teamId))
    if (isStaffLevel(role)) return users.filter(u => u.id !== selfId && isStaffLevel(u.role) && u.teamId === Number(teamId))
    return []
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const data = { ...formData, projectId: Number(projectId), teamId: Number(teamId), assignedToId: formData.assignedToId || null, dueDate: formData.dueDate || null }
      if (editingTask) await taskService.update(editingTask.id, data)
      else await taskService.create(data)
      setShowModal(false)
      setEditingTask(null)
      resetForm()
      loadData()
    } catch (err) { setError(err.response?.data?.message || err.message || 'Failed to save') } finally { setSubmitting(false) }
  }

  const handleEdit = (task) => {
    setEditingTask(task)
    setFormData({ title: task.title, description: task.description || '', status: task.status, priority: task.priority, projectId: task.projectId || '', teamId: task.teamId || '', assignedToId: task.assignedToId || '', dueDate: task.dueDate ? task.dueDate.split('T')[0] : '' })
    setShowModal(true)
  }

  const handleDelete = async (taskId) => {
    if (confirm('Delete this task?')) { try { await taskService.delete(taskId); loadData() } catch (err) { alert('Failed to delete') } }
  }

  const resetForm = () => setFormData({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', assignedToId: '', dueDate: '' })

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (!project || !team) return <div className="text-center py-8">Not found</div>

  const activeTasks = tasks.filter(t => t.status !== 'COMPLETED')
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED')

  return (
    <div className="space-y-6">
      <div className="text-sm text-gray-500">
        <button onClick={() => navigate(`/projects/${projectId}`)} className="text-blue-600 hover:text-blue-800">&larr; Back to {project.name}</button>
      </div>

      <div className="card bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{team.name}</h1>
            <p className="text-sm text-gray-500">Project: {project.name} | {team.publicId}</p>
            <p className="text-gray-600 text-sm mt-1">{team.description || ''}</p>
            <div className="flex gap-2 mt-2 text-xs">
              {team.teamLeadName && <span className="badge badge-green">Team Lead: {team.teamLeadName}</span>}
              {team.managerName && <span className="badge badge-blue">Manager: {team.managerName}</span>}
            </div>
          </div>
          <div className="text-right text-sm">
            <p className="text-gray-500">{team.memberCount || 0} members</p>
            <p className="text-gray-500">{tasks.length} total tasks</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-800">Team Tasks</h2>
        {isManager && (
          <button onClick={() => { resetForm(); setEditingTask(null); setShowModal(true) }} className="btn btn-primary">
            Add Task
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="bg-blue-50 px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-blue-800">Active Tasks</h2>
          <p className="text-sm text-blue-600">{activeTasks.length} active task(s)</p>
        </div>
        {activeTasks.length > 0 ? (
          <table className="table">
            <thead><tr><th>Title</th><th>Assigned To</th><th>Status</th><th>Priority</th><th>Due Date</th>{isManager && <th>Actions</th>}</tr></thead>
            <tbody>
              {activeTasks.map(task => (
                <tr key={task.id}>
                  <td className="font-medium">
                    <button onClick={() => navigate(`/projects/${projectId}/teams/${teamId}/tasks/${task.id}`)}
                      className="text-blue-600 hover:text-blue-800 hover:underline">{task.title}</button>
                  </td>
                  <td>{task.assignedToName || '-'}</td>
                  <td><span className={`badge badge-${getStatusColor(task.status)}`}>{getStatusLabel(task.status)}</span></td>
                  <td><span className={`badge badge-${task.priority === 'HIGH' ? 'red' : task.priority === 'MEDIUM' ? 'blue' : 'gray'}`}>{task.priority}</span></td>
                  <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                  {isManager && (
                    <td>
                      <button onClick={() => handleEdit(task)} className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                      <button onClick={() => handleDelete(task.id)} className="text-red-600 hover:text-red-800">Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-500">No active tasks for this team.</div>
        )}
      </div>

      {completedTasks.length > 0 && (
        <div className="card overflow-hidden border-2 border-gray-200">
          <div className="bg-green-50 px-4 py-3 border-b">
            <h2 className="text-lg font-semibold text-green-800">Completed Tasks ({completedTasks.length})</h2>
          </div>
          <table className="table">
            <thead><tr><th>Title</th><th>Assigned To</th><th>Status</th><th>Priority</th><th>Due Date</th></tr></thead>
            <tbody>
              {completedTasks.map(task => (
                <tr key={task.id} className="bg-gray-50">
                  <td className="font-medium text-gray-500">{task.title}</td>
                  <td>{task.assignedToName || '-'}</td>
                  <td><span className="badge badge-green">Completed</span></td>
                  <td><span className="badge badge-gray">{task.priority}</span></td>
                  <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">{editingTask ? 'Edit Task' : 'Create Task'} - {team.name}</h3>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Title" className="input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              <textarea placeholder="Description" className="input" rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <select className="input" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                  {(editingTask ? TASK_STATUSES.EDIT : TASK_STATUSES.CREATE).map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                </select>
                <select className="input" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                  <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select className="input" value={formData.assignedToId} onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}>
                  <option value="">Assign To</option>
                  {getFilteredUsers().map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role})</option>)}
                </select>
                <input type="date" className="input" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>{submitting ? 'Saving...' : (editingTask ? 'Update' : 'Create')}</button>
                <button type="button" onClick={() => { setShowModal(false); setError('') }} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
