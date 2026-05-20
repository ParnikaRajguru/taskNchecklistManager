import { useState, useEffect } from 'react'
import { taskService, projectService, teamService, userService, noteService } from '../services/api'
import { useAuth } from '../context/AuthContext'

const TASK_STATUSES = {
  CREATE: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'TESTING', 'BLOCKED'],
  EDIT: ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'TESTING', 'BLOCKED', 'COMPLETED']
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

function getStatusLabel(status) {
  const labels = {
    TODO: 'Todo',
    IN_PROGRESS: 'In Progress',
    IN_REVIEW: 'In Review',
    TESTING: 'Testing',
    COMPLETED: 'Completed',
    BLOCKED: 'Blocked'
  }
  return labels[status] || status
}

function getPriorityColor(priority) {
  const colors = {
    LOW: 'gray',
    MEDIUM: 'blue',
    HIGH: 'red'
  }
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

  useEffect(() => {
    loadData()
  }, [])

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
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
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
      setError(err.response?.data?.message || err.message || 'Failed to save task')
    } finally {
      setSubmitting(false)
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

  const handleViewTask = async (task) => {
    setSelectedTask(task)
    setShowDetailsModal(true)
    setLoadingNotes(true)
    try {
      const response = await noteService.getByTask(task.id)
      setNotes(response.data)
    } catch (err) {
      setNotes([])
    } finally {
      setLoadingNotes(false)
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
    } catch (err) {
      alert('Failed to add note')
    } finally {
      setAddingNote(false)
    }
  }

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return
    try {
      await noteService.deleteNote(noteId)
      const response = await noteService.getByTask(selectedTask.id)
      setNotes(response.data)
    } catch (err) {
      alert('Failed to delete note')
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
      assignedToId: '',
      dueDate: ''
    })
  }

  const isManager = ['SUPER_ADMIN', 'MANAGER', 'TEAM_LEAD'].includes(user?.role)

  const getFilteredProjects = () => {
    if (!user) return []
    const role = user.role
    const selfId = user.id
    
    if (role === 'SUPER_ADMIN') {
      return projects
    }
    
    if (role === 'MANAGER') {
      const managedProjectsIds = teams
        .filter(t => t.managerId === selfId)
        .map(t => t.projectId)
        .filter(Boolean)
      return projects.filter(p => managedProjectsIds.includes(p.id))
    }
    
    const ownTeam = teams.find(t => t.id === user.teamId)
    if (ownTeam && ownTeam.projectId) {
      return projects.filter(p => p.id === ownTeam.projectId)
    }
    
    return []
  }

  const getFilteredTeams = () => {
    if (!user) return []
    const role = user.role
    const selfId = user.id
    const selectedProjectId = formData.projectId ? Number(formData.projectId) : null
    
    let filtered = teams
    
    if (role === 'MANAGER') {
      filtered = teams.filter(t => t.managerId === selfId)
    } else if (role !== 'SUPER_ADMIN') {
      if (user.teamId) {
        filtered = teams.filter(t => t.id === user.teamId)
      } else {
        filtered = []
      }
    }
    
    if (selectedProjectId) {
      filtered = filtered.filter(t => t.projectId === selectedProjectId)
    }
    
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
      if (currentTeamId) {
        filtered = filtered.filter(u => u.teamId === currentTeamId)
      }
      return filtered
    }

    if (role === 'MANAGER') {
      const managedTeamIds = teams.filter(t => t.managerId === selfId).map(t => t.id)
      
      return users.filter(u => {
        if (u.id === selfId) return false
        if (u.role === 'SUPER_ADMIN' || u.role === 'MANAGER') return false
        
        if (currentTeamId) {
          return u.teamId === currentTeamId && managedTeamIds.includes(currentTeamId)
        }
        
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

      <div className="space-y-8">
        <div className="card overflow-hidden">
          <div className="bg-blue-50 px-4 py-3 border-b">
            <h2 className="text-lg font-semibold text-blue-800">Active Tasks</h2>
            <p className="text-sm text-blue-600">{activeTasks.length} active task(s)</p>
          </div>
          {activeTasks.length > 0 ? (
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
                      <button
                        onClick={() => handleViewTask(task)}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {task.title}
                      </button>
                    </td>
                    <td>{task.projectName || '-'}</td>
                    <td>{task.teamName || '-'}</td>
                    <td>{task.assignedToName || '-'}</td>
                    <td>
                      <span className={`badge badge-${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                    {isManager && (
                      <td>
                        <button onClick={() => handleEdit(task)} className="text-blue-600 hover:text-blue-800 mr-3">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(task.id)} className="text-red-600 hover:text-red-800">
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No active tasks found. {isManager ? 'Click "Add Task" to create one.' : ''}
            </div>
          )}
        </div>

        <div className="card overflow-hidden border-2 border-gray-200">
          <div className="bg-green-50 px-4 py-3 border-b">
            <h2 className="text-lg font-semibold text-green-800">Completed Tasks History</h2>
            <p className="text-sm text-green-600">{completedTasks.length} completed task(s)</p>
          </div>
          {completedTasks.length > 0 ? (
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
                  <tr key={task.id} className="bg-gray-50">
                    <td className="font-medium">
                      <button
                        onClick={() => handleViewTask(task)}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {task.title}
                      </button>
                    </td>
                    <td>{task.projectName || '-'}</td>
                    <td>{task.teamName || '-'}</td>
                    <td>{task.assignedToName || '-'}</td>
                    <td>
                      <span className={`badge badge-${getStatusColor(task.status)}`}>
                        {getStatusLabel(task.status)}
                      </span>
                    </td>
                    <td>
                      <span className={`badge badge-${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </td>
                    <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                    {isManager && (
                      <td>
                        <button onClick={() => handleEdit(task)} className="text-blue-600 hover:text-blue-800 mr-3">
                          Edit
                        </button>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No completed tasks yet.
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">
              {editingTask ? 'Edit Task' : 'Create Task'}
            </h3>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
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
                  {(editingTask ? TASK_STATUSES.EDIT : TASK_STATUSES.CREATE).map(status => (
                    <option key={status} value={status}>{getStatusLabel(status)}</option>
                  ))}
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
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value, teamId: '', assignedToId: '' })}
                >
                  <option value="">Select Project</option>
                  {getFilteredProjects().map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
                <select
                  className="input"
                  value={formData.teamId}
                  onChange={(e) => setFormData({ ...formData, teamId: e.target.value, assignedToId: '' })}
                >
                  <option value="">Select Team</option>
                  {getFilteredTeams().map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="input"
                  value={formData.assignedToId}
                  onChange={(e) => setFormData({ ...formData, assignedToId: e.target.value })}
                >
                  <option value="">Assign To</option>
                  {getFilteredUsers().map((u) => (
                    <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role})</option>
                  ))}
                </select>
                <input
                  type="date"
                  className="input"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>
                  {submitting ? 'Saving...' : (editingTask ? 'Update' : 'Create')}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setError('') }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetailsModal && selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800">{selectedTask.title}</h3>
                <p className="text-sm text-gray-500">
                  {selectedTask.projectName && `Project: ${selectedTask.projectName}`}
                  {selectedTask.teamName && ` | Team: ${selectedTask.teamName}`}
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                &times;
              </button>
            </div>

            <div className="mb-4">
              <div className="flex gap-2 mb-3">
                <span className={`badge badge-${getStatusColor(selectedTask.status)}`}>
                  {selectedTask.status}
                </span>
                <span className={`badge badge-${getPriorityColor(selectedTask.priority)}`}>
                  {selectedTask.priority}
                </span>
              </div>
              {selectedTask.description && (
                <p className="text-gray-600 mb-2">{selectedTask.description}</p>
              )}
              <div className="text-sm text-gray-500">
                <p>Assigned to: {selectedTask.assignedToName || 'Unassigned'}</p>
                <p>Due Date: {selectedTask.dueDate ? new Date(selectedTask.dueDate).toLocaleDateString() : 'Not set'}</p>
                <p>Created: {selectedTask.createdByName || 'Unknown'}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="text-lg font-semibold mb-3">Notes</h4>

              <form onSubmit={handleAddNote} className="mb-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Add a note..."
                    className="input flex-1"
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={addingNote || !newNote.trim()}
                  >
                    {addingNote ? 'Adding...' : 'Add'}
                  </button>
                </div>
              </form>

              {loadingNotes ? (
                <div className="text-center py-4 text-gray-500">Loading notes...</div>
              ) : notes.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No notes yet</div>
              ) : (
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sm">
                            {note.createdByName}
                            <span className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                              note.createdByRole === 'SUPER_ADMIN' ? 'bg-red-100 text-red-800' :
                              note.createdByRole === 'MANAGER' ? 'bg-blue-100 text-blue-800' :
                              note.createdByRole === 'TEAM_LEAD' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {note.createdByRole}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500">
                            {note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}
                          </p>
                        </div>
                        {user?.role === 'SUPER_ADMIN' && (
                          <button
                            onClick={() => handleDeleteNote(note.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                      <p className="mt-2 text-gray-700">{note.content}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}