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

  if (loading) return <div className="text-center py-8"><div className="skeleton h-8 w-64 mx-auto mb-4" /><div className="skeleton h-32 w-full rounded-xl mb-4" /><div className="skeleton h-48 w-full rounded-xl" /></div>
  if (!project || !team) return <div className="empty-state card py-12"><p className="empty-state-text">Not found</p></div>

  const activeTasks = tasks.filter(t => t.status !== 'COMPLETED')
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED')

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate(`/projects/${projectId}`)} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
        Back to {project.name}
      </button>

      <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-2xl p-6 text-white shadow-lg shadow-primary-500/20">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-primary-200 text-xs font-medium mb-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
              {project.name}
            </div>
            <h1 className="text-2xl font-bold">{team.name}</h1>
            <p className="text-primary-200 text-sm mt-1">{team.publicId}</p>
            {team.description && <p className="text-primary-100 text-sm mt-2">{team.description}</p>}
            <div className="flex flex-wrap gap-2 mt-3">
              {team.teamLeadName && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium">Team Lead: {team.teamLeadName}</span>}
              {team.managerName && <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-white/10 backdrop-blur-sm rounded-full text-xs font-medium">Manager: {team.managerName}</span>}
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
              <p className="text-2xl font-bold">{team.memberCount || 0}</p>
              <p className="text-xs text-primary-200">members</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center mt-2">
              <p className="text-2xl font-bold">{tasks.length}</p>
              <p className="text-xs text-primary-200">tasks</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Team Tasks</h2>
        {isManager && (
          <button onClick={() => { resetForm(); setEditingTask(null); setShowModal(true) }} className="btn btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Add Task
          </button>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="section-header px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="section-title">Active Tasks</h2>
              <p className="section-subtitle">{activeTasks.length} active task(s)</p>
            </div>
            <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08" /></svg>
          </div>
        </div>
        {activeTasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead><tr><th>Title</th><th>Assigned To</th><th>Status</th><th>Priority</th><th>Due Date</th>{isManager && <th>Actions</th>}</tr></thead>
              <tbody>
                {activeTasks.map(task => (
                  <tr key={task.id}>
                    <td className="font-medium">
                      <button onClick={() => navigate(`/projects/${projectId}/teams/${teamId}/tasks/${task.id}`)}
                        className="text-primary-600 hover:text-primary-700 hover:underline font-medium">{task.title}</button>
                    </td>
                    <td className="text-slate-500">{task.assignedToName || '-'}</td>
                    <td><span className={`badge badge-${getStatusColor(task.status)}`}>{getStatusLabel(task.status)}</span></td>
                    <td><span className={`badge badge-${task.priority === 'HIGH' ? 'red' : task.priority === 'MEDIUM' ? 'blue' : 'gray'}`}>{task.priority}</span></td>
                    <td className="text-slate-500">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                    {isManager && (
                      <td>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEdit(task)} className="btn btn-ghost text-xs px-2 py-1">Edit</button>
                          <button onClick={() => handleDelete(task.id)} className="btn btn-ghost text-xs px-2 py-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50">Delete</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state py-8"><p className="empty-state-text">No active tasks for this team.</p></div>
        )}
      </div>

      {completedTasks.length > 0 && (
        <div className="card overflow-hidden border border-slate-200">
          <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-700">Completed Tasks ({completedTasks.length})</h2>
              </div>
              <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="table">
              <thead><tr><th>Title</th><th>Assigned To</th><th>Status</th><th>Priority</th><th>Due Date</th></tr></thead>
              <tbody>
                {completedTasks.map(task => (
                  <tr key={task.id} className="bg-slate-50/50">
                    <td className="font-medium text-slate-500">{task.title}</td>
                    <td className="text-slate-500">{task.assignedToName || '-'}</td>
                    <td><span className="badge badge-green">Completed</span></td>
                    <td><span className="badge badge-gray">{task.priority}</span></td>
                    <td className="text-slate-500">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); setError('') }}}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{editingTask ? 'Edit Task' : 'Create Task'} - {team.name}</h3>
              <button onClick={() => { setShowModal(false); setError('') }} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {error && <div className="mx-6 mt-4 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700"><svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                  <input type="text" placeholder="Enter task title" className="input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <textarea placeholder="Enter description" className="input" rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                    <select className="input" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                      {(editingTask ? TASK_STATUSES.EDIT : TASK_STATUSES.CREATE).map(s => <option key={s} value={s}>{getStatusLabel(s)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
                    <select className="input" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                      <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign To</label>
                    <select className="input" value={formData.assignedToId} onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}>
                      <option value="">Assign To</option>
                      {getFilteredUsers().map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role})</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Due Date</label>
                    <input type="date" className="input" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => { setShowModal(false); setError('') }} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <span className="flex items-center gap-2"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving...</span>
                  ) : (editingTask ? 'Update Task' : 'Create Task')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
