import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { taskService, projectService, teamService, userService, noteService } from '../services/api'
import { useAuth } from '../context/AuthContext'

const TASK_STATUSES = {
  CREATE: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'TESTING', 'BLOCKED'],
  EDIT: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'TESTING', 'BLOCKED', 'COMPLETED']
}

function getStatusColor(status) {
  const colors = { TODO: 'blue', IN_PROGRESS: 'yellow', IN_REVIEW: 'purple', TESTING: 'orange', COMPLETED: 'green', BLOCKED: 'red' }
  return colors[status] || 'gray'
}

function getStatusLabel(status) {
  const labels = { TODO: 'Todo', IN_PROGRESS: 'In Progress', IN_REVIEW: 'In Review', TESTING: 'Testing', COMPLETED: 'Completed', BLOCKED: 'Blocked' }
  return labels[status] || status
}

function getPriorityColor(priority) {
  const colors = { LOW: 'gray', MEDIUM: 'blue', HIGH: 'red' }
  return colors[priority] || 'gray'
}

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [activeTasks, setActiveTasks] = useState([])
  const [completedTasks, setCompletedTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [teams, setTeams] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [editingTask, setEditingTask] = useState(null)
  const [error, setError] = useState('')
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState('')
  const [loadingNotes, setLoadingNotes] = useState(false)
  const [addingNote, setAddingNote] = useState(false)
  const navigate = useNavigate()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'TODO',
    priority: 'MEDIUM',
    projectId: '',
    teamId: '',
    assignedToId: '',
    dueDate: ''
  })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [tasksRes, projectsRes, teamsRes, usersRes] = await Promise.all([
        taskService.getAll(),
        projectService.getAll(),
        teamService.getAll(),
        userService.getAll().catch(() => ({ data: [] }))
      ])
      setTasks(tasksRes.data)
      const active = tasksRes.data.filter(t => t.status !== 'COMPLETED')
      const completed = tasksRes.data.filter(t => t.status === 'COMPLETED')
      setActiveTasks(active)
      setCompletedTasks(completed)
      setProjects(projectsRes.data)
      setTeams(teamsRes.data)
      setUsers(usersRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const data = {
        ...formData,
        projectId: formData.projectId || null,
        teamId: formData.teamId || null,
        assignedToId: formData.assignedToId || null,
        dueDate: formData.dueDate || null
      }
      if (editingTask) await taskService.update(editingTask.id, data)
      else await taskService.create(data)
      setShowModal(false)
      setEditingTask(null)
      resetForm()
      loadData()
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save task')
    } finally { setSubmitting(false) }
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
      assignedToId: task.assignedToId || '',
      dueDate: task.dueDate ? task.dueDate.split('T')[0] : ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try { await taskService.delete(id); loadData() }
      catch (err) { alert('Failed to delete task') }
    }
  }

  const handleViewTask = (task) => {
    if (task.teamId && task.projectId) {
      navigate(`/projects/${task.projectId}/teams/${task.teamId}/tasks/${task.id}`)
    } else {
      navigate(`/tasks/${task.id}`)
    }
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!newNote.trim()) return
    setAddingNote(true)
    try {
      await noteService.addNote(selectedTask.id, newNote)
      setNewNote('')
      const response = await noteService.getByTask(selectedTask.id)
      setNotes(response.data)
    } catch (err) { alert('Failed to add note') }
    finally { setAddingNote(false) }
  }

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return
    try {
      await noteService.deleteNote(noteId)
      const response = await noteService.getByTask(selectedTask.id)
      setNotes(response.data)
    } catch (err) { alert('Failed to delete note') }
  }

  const resetForm = () => {
    setFormData({ title: '', description: '', status: 'TODO', priority: 'MEDIUM', projectId: '', teamId: '', assignedToId: '', dueDate: '' })
  }

  const isManager = ['SUPER_ADMIN', 'MANAGER', 'TEAM_LEAD'].includes(user?.role)

  const getFilteredProjects = () => {
    if (!user) return []
    const role = user.role
    const selfId = user.id
    if (role === 'SUPER_ADMIN') return projects
    if (role === 'MANAGER') {
      const managedProjectsIds = teams.filter(t => t.managerId === selfId).map(t => t.projectId).filter(Boolean)
      return projects.filter(p => managedProjectsIds.includes(p.id))
    }
    const ownTeam = teams.find(t => t.id === user.teamId)
    if (ownTeam && ownTeam.projectId) return projects.filter(p => p.id === ownTeam.projectId)
    return []
  }

  const getFilteredTeams = () => {
    if (!user) return []
    const role = user.role
    const selfId = user.id
    const selectedProjectId = formData.projectId ? Number(formData.projectId) : null
    let filtered = teams
    if (role === 'MANAGER') filtered = teams.filter(t => t.managerId === selfId)
    else if (role !== 'SUPER_ADMIN') {
      if (user.teamId) filtered = teams.filter(t => t.id === user.teamId)
      else filtered = []
    }
    if (selectedProjectId) filtered = filtered.filter(t => t.projectId === selectedProjectId)
    return filtered
  }

  const getFilteredUsers = () => {
    if (!user) return []
    const role = user.role
    const selfId = user.id
    const currentTeamId = formData.teamId ? Number(formData.teamId) : null
    const isStaffLevel = (r) => ['STAFF', 'DEVELOPER', 'TESTER'].includes(r)
    if (role === 'SUPER_ADMIN') {
      let filtered = users.filter(u => u.id !== selfId)
      if (currentTeamId) filtered = filtered.filter(u => u.teamId === currentTeamId)
      return filtered
    }
    if (role === 'MANAGER') {
      const managedTeamIds = teams.filter(t => t.managerId === selfId).map(t => t.id)
      return users.filter(u => {
        if (u.id === selfId) return false
        if (u.role === 'SUPER_ADMIN' || u.role === 'MANAGER') return false
        if (currentTeamId) return u.teamId === currentTeamId && managedTeamIds.includes(currentTeamId)
        return u.teamId && managedTeamIds.includes(u.teamId)
      })
    }
    if (role === 'TEAM_LEAD') {
      const leadTeamId = user.teamId
      if (!leadTeamId) return []
      return users.filter(u => {
        if (u.id === selfId) return false
        if (u.role === 'SUPER_ADMIN' || u.role === 'MANAGER' || u.role === 'TEAM_LEAD') return false
        if (currentTeamId && currentTeamId !== leadTeamId) return false
        return u.teamId === leadTeamId
      })
    }
    if (isStaffLevel(role)) {
      const staffTeamId = user.teamId
      if (!staffTeamId) return []
      return users.filter(u => {
        if (u.id === selfId) return false
        if (u.role === 'SUPER_ADMIN' || u.role === 'MANAGER' || u.role === 'TEAM_LEAD') return false
        if (currentTeamId && currentTeamId !== staffTeamId) return false
        return u.teamId === staffTeamId
      })
    }
    return []
  }

  if (loading) return <div className="text-center py-8"><div className="skeleton h-8 w-48 mx-auto mb-4" /><div className="skeleton h-64 w-full rounded-xl" /></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Tasks</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your tasks across projects</p>
        </div>
        {isManager && (
          <button onClick={() => { resetForm(); setEditingTask(null); setShowModal(true) }} className="btn btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Add Task
          </button>
        )}
      </div>

      <div className="space-y-8">
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
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Project</th>
                    <th>Team</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    {isManager && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {activeTasks.map((task) => (
                    <tr key={task.id}>
                      <td className="font-medium">
                        <button onClick={() => handleViewTask(task)} className="text-primary-600 hover:text-primary-700 hover:underline font-medium">
                          {task.title}
                        </button>
                      </td>
                      <td className="text-slate-500">{task.projectName || '-'}</td>
                      <td className="text-slate-500">{task.teamName || '-'}</td>
                      <td className="text-slate-500">{task.assignedToName || '-'}</td>
                      <td><span className={`badge badge-${getStatusColor(task.status)}`}>{getStatusLabel(task.status)}</span></td>
                      <td><span className={`badge badge-${getPriorityColor(task.priority)}`}>{task.priority}</span></td>
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
            <div className="empty-state py-8">
              <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08" /></svg>
              <p className="empty-state-text">No active tasks found.</p>
              {isManager && <p className="empty-state-action">Click "Add Task" to create one.</p>}
            </div>
          )}
        </div>

        {completedTasks.length > 0 && (
          <div className="card overflow-hidden">
            <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-slate-700">Completed Tasks History</h2>
                  <p className="text-xs text-slate-500">{completedTasks.length} completed task(s)</p>
                </div>
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Project</th>
                    <th>Team</th>
                    <th>Assigned To</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Due Date</th>
                    {isManager && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {completedTasks.map((task) => (
                    <tr key={task.id} className="bg-slate-50/50">
                      <td className="font-medium text-slate-500">
                        <button onClick={() => handleViewTask(task)} className="text-primary-600 hover:text-primary-700 hover:underline font-medium">
                          {task.title}
                        </button>
                      </td>
                      <td className="text-slate-500">{task.projectName || '-'}</td>
                      <td className="text-slate-500">{task.teamName || '-'}</td>
                      <td className="text-slate-500">{task.assignedToName || '-'}</td>
                      <td><span className="badge badge-green">Completed</span></td>
                      <td><span className={`badge badge-${getPriorityColor(task.priority)}`}>{task.priority}</span></td>
                      <td className="text-slate-500">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                      {isManager && (
                        <td>
                          <button onClick={() => handleEdit(task)} className="btn btn-ghost text-xs px-2 py-1">Edit</button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); setError('') }}}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{editingTask ? 'Edit Task' : 'Create Task'}</h3>
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
                      {(editingTask ? TASK_STATUSES.EDIT : TASK_STATUSES.CREATE).map(status => (
                        <option key={status} value={status}>{getStatusLabel(status)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
                    <select className="input" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Project</label>
                    <select className="input" value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value, teamId: '', assignedToId: '' })}>
                      <option value="">Select Project</option>
                      {getFilteredProjects().map((p) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Team</label>
                    <select className="input" value={formData.teamId} onChange={(e) => setFormData({ ...formData, teamId: e.target.value, assignedToId: '' })}>
                      <option value="">Select Team</option>
                      {getFilteredTeams().map((t) => (
                        <option key={t.id} value={t.id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Assign To</label>
                    <select className="input" value={formData.assignedToId} onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}>
                      <option value="">Assign To</option>
                      {getFilteredUsers().map((u) => (
                        <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role})</option>
                      ))}
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

      {showDetailsModal && selectedTask && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowDetailsModal(false) }}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-slate-900">{selectedTask.title}</h3>
                {selectedTask.projectName && <p className="text-sm text-slate-500">{selectedTask.projectName}</p>}
              </div>
              <button onClick={() => setShowDetailsModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="flex gap-2 mb-3">
                <span className={`badge badge-${getStatusColor(selectedTask.status)}`}>{getStatusLabel(selectedTask.status)}</span>
                <span className={`badge badge-${getPriorityColor(selectedTask.priority)}`}>{selectedTask.priority}</span>
              </div>
              {selectedTask.description && <p className="text-sm text-slate-600 mb-4">{selectedTask.description}</p>}
              <div className="text-sm text-slate-500 space-y-1 mb-4">
                <p>Assigned to: <span className="font-medium text-slate-700">{selectedTask.assignedToName || 'Unassigned'}</span></p>
                <p>Team: <span className="font-medium text-slate-700">{selectedTask.teamName || '-'}</span></p>
              </div>
              <button onClick={() => { setShowDetailsModal(false); handleViewTask(selectedTask) }} className="btn btn-primary w-full">
                View Full Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
