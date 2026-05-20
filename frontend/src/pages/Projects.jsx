import { useState, useEffect } from 'react'
import { projectService } from '../services/api'
import { useAuth } from '../context/AuthContext'

const PROJECT_STATUSES = {
  CREATE: ['ACTIVE', 'ON_HOLD'],
  EDIT: ['ACTIVE', 'ON_HOLD', 'COMPLETED']
}

function getProjectStatusLabel(status) {
  const labels = {
    ACTIVE: 'Active',
    ON_HOLD: 'On Hold',
    PLANNING: 'Planning',
    COMPLETED: 'Completed'
  }
  return labels[status] || status
}

export default function Projects() {
  const [projects, setProjects] = useState([])
  const [activeProjects, setActiveProjects] = useState([])
  const [completedProjects, setCompletedProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE',
    startDate: '',
    endDate: ''
  })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const res = await projectService.getAll()
      setProjects(res.data)
      const active = res.data.filter(p => p.status !== 'COMPLETED')
      const completed = res.data.filter(p => p.status === 'COMPLETED')
      setActiveProjects(active)
      setCompletedProjects(completed)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const getErrorMessage = (err) => {
    if (err.response?.data?.errors) {
      return Object.values(err.response.data.errors).join(', ')
    }
    return err.response?.data?.message || err.message || 'Failed to save'
  }

  const validateDates = () => {
    if (formData.startDate && formData.endDate && formData.startDate >= formData.endDate) {
      setError('End date must be after start date')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validateDates()) return
    setSubmitting(true)
    try {
      const data = {
        ...formData,
        startDate: formData.startDate || null,
        endDate: formData.endDate || null
      }
      if (editingProject) {
        await projectService.update(editingProject.id, data)
      } else {
        await projectService.create(data)
      }
      setShowModal(false)
      setEditingProject(null)
      resetForm()
      loadData()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (project) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status || 'ACTIVE',
      startDate: project.startDate || '',
      endDate: project.endDate || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this project?')) {
      try {
        await projectService.delete(id)
        loadData()
      } catch (err) { alert('Failed to delete') }
    }
  }

  const resetForm = () => setFormData({ name: '', description: '', status: 'ACTIVE', startDate: '', endDate: '' })

  const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(user?.role)

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Projects</h1>
        {isManager && (
          <button onClick={() => { resetForm(); setEditingProject(null); setShowModal(true) }} className="btn btn-primary">
            Add Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500">No projects assigned to you.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <div className="card">
            <div className="bg-blue-50 px-4 py-3 border-b">
              <h2 className="text-lg font-semibold text-blue-800">Active Projects</h2>
              <p className="text-sm text-blue-600">{activeProjects.length} active project(s)</p>
            </div>
            {activeProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {activeProjects.map((project) => (
                  <div key={project.id} className="card">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        <span className="text-xs font-mono text-gray-400">{project.publicId}</span>
                      </div>
                      <span className={`badge badge-${project.status === 'ACTIVE' ? 'green' : 'gray'}`}>
                        {getProjectStatusLabel(project.status)}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">{project.description || 'No description'}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <p className="text-lg font-bold text-blue-600">{project.teamCount || 0}</p>
                        <p className="text-xs text-gray-500">Teams</p>
                      </div>
                      <div className="bg-green-50 p-2 rounded text-center">
                        <p className="text-lg font-bold text-green-600">{project.taskCount || 0}</p>
                        <p className="text-xs text-gray-500">Tasks</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      {project.startDate && <p>Started: {project.startDate}</p>}
                      {project.endDate && <p>Due: {project.endDate}</p>}
                    </div>
                    {isManager && (
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(project)} className="btn btn-secondary text-sm">Edit</button>
                        <button onClick={() => handleDelete(project.id)} className="btn btn-danger text-sm">Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 p-4">
                No active projects found. {isManager ? 'Click "Add Project" to create one.' : ''}
              </div>
            )}
          </div>

          <div className="card border-2 border-gray-200">
            <div className="bg-green-50 px-4 py-3 border-b">
              <h2 className="text-lg font-semibold text-green-800">Completed Projects History</h2>
              <p className="text-sm text-green-600">{completedProjects.length} completed project(s)</p>
            </div>
            {completedProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                {completedProjects.map((project) => (
                  <div key={project.id} className="card bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold text-lg">{project.name}</h3>
                        <span className="text-xs font-mono text-gray-400">{project.publicId}</span>
                      </div>
                      <span className="badge badge-green">
                        {getProjectStatusLabel(project.status)}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-4">{project.description || 'No description'}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <p className="text-lg font-bold text-blue-600">{project.teamCount || 0}</p>
                        <p className="text-xs text-gray-500">Teams</p>
                      </div>
                      <div className="bg-green-50 p-2 rounded text-center">
                        <p className="text-lg font-bold text-green-600">{project.taskCount || 0}</p>
                        <p className="text-xs text-gray-500">Tasks</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mb-2">
                      {project.startDate && <p>Started: {project.startDate}</p>}
                      {project.endDate && <p>Due: {project.endDate}</p>}
                    </div>
                    {isManager && (
                      <div className="flex gap-2">
                        <button onClick={() => handleEdit(project)} className="btn btn-secondary text-sm">Edit</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 p-4">
                No completed projects yet.
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">{editingProject ? 'Edit' : 'Create'} Project</h3>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Project Name" className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              <textarea placeholder="Description" className="input" rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              <select className="input" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                {(editingProject ? PROJECT_STATUSES.EDIT : PROJECT_STATUSES.CREATE).map(status => (
                  <option key={status} value={status}>{getProjectStatusLabel(status)}</option>
                ))}
              </select>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                  <input type="date" className="input" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} max={formData.endDate || undefined} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Date</label>
                  <input type="date" className="input" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} min={formData.startDate || undefined} />
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>{submitting ? 'Saving...' : (editingProject ? 'Update' : 'Create')}</button>
                <button type="button" onClick={() => { setShowModal(false); setError('') }} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
