import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
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

function getStatusBadgeColor(status) {
  const colors = { ACTIVE: 'green', ON_HOLD: 'yellow', PLANNING: 'blue', COMPLETED: 'gray' }
  return colors[status] || 'gray'
}

export default function Projects() {
  const navigate = useNavigate()
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

  if (loading) return <div className="text-center py-8"><div className="skeleton h-8 w-48 mx-auto mb-4" /><div className="skeleton h-64 w-full rounded-xl" /></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Projects</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your store projects</p>
        </div>
        {isManager && (
          <button onClick={() => { resetForm(); setEditingProject(null); setShowModal(true) }} className="btn btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Add Project
          </button>
        )}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state card py-12">
          <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
          <p className="empty-state-text">No projects assigned to you.</p>
          {isManager && <p className="empty-state-action">Click "Add Project" to create one.</p>}
        </div>
      ) : (
        <div className="space-y-8">
          <div className="card overflow-hidden">
            <div className="section-header px-5 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="section-title">Active Projects</h2>
                  <p className="section-subtitle">{activeProjects.length} active project(s)</p>
                </div>
                <svg className="w-5 h-5 text-primary-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>
              </div>
            </div>
            {activeProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                {activeProjects.map((project) => (
                  <div key={project.id} className="card card-hover p-5" onClick={() => navigate(`/projects/${project.id}`)}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-900 truncate">{project.name}</h3>
                        <span className="text-xs font-mono text-slate-400">{project.publicId}</span>
                      </div>
                      <span className={`badge badge-${getStatusBadgeColor(project.status)} shrink-0`}>
                        {getProjectStatusLabel(project.status)}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{project.description || 'No description'}</p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-primary-50/50 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-primary-600">{project.teamCount || 0}</p>
                        <p className="text-xs text-slate-500">Teams</p>
                      </div>
                      <div className="bg-emerald-50/50 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-emerald-600">{project.taskCount || 0}</p>
                        <p className="text-xs text-slate-500">Tasks</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-3">
                      {project.startDate && <span>Started: {project.startDate}</span>}
                      {project.endDate && <span>Due: {project.endDate}</span>}
                    </div>
                    {isManager && (
                      <div className="flex gap-2 pt-2 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleEdit(project)} className="btn btn-ghost text-xs px-3 py-1.5">Edit</button>
                        <button onClick={() => handleDelete(project.id)} className="btn btn-ghost text-xs px-3 py-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50">Delete</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state py-8">
                <p className="empty-state-text">No active projects found.</p>
                {isManager && <p className="empty-state-action">Click "Add Project" to create one.</p>}
              </div>
            )}
          </div>

          {completedProjects.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 bg-slate-50/80 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-semibold text-slate-700">Completed Projects History</h2>
                    <p className="text-xs text-slate-500">{completedProjects.length} completed project(s)</p>
                  </div>
                  <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
                {completedProjects.map((project) => (
                  <div key={project.id} className="card card-hover p-5 bg-slate-50/50" onClick={() => navigate(`/projects/${project.id}`)}>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-slate-700 truncate">{project.name}</h3>
                        <span className="text-xs font-mono text-slate-400">{project.publicId}</span>
                      </div>
                      <span className="badge badge-gray shrink-0">Completed</span>
                    </div>
                    <p className="text-sm text-slate-500 mb-4 line-clamp-2">{project.description || 'No description'}</p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      <div className="bg-slate-100 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-slate-600">{project.teamCount || 0}</p>
                        <p className="text-xs text-slate-500">Teams</p>
                      </div>
                      <div className="bg-slate-100 rounded-lg p-3 text-center">
                        <p className="text-lg font-bold text-slate-600">{project.taskCount || 0}</p>
                        <p className="text-xs text-slate-500">Tasks</p>
                      </div>
                    </div>
                    {isManager && (
                      <div className="pt-2 border-t border-slate-200" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => handleEdit(project)} className="btn btn-ghost text-xs px-3 py-1.5">Edit</button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); setError('') }}}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{editingProject ? 'Edit' : 'Create'} Project</h3>
              <button onClick={() => { setShowModal(false); setError('') }} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {error && <div className="mx-6 mt-4 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700"><svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Project Name</label>
                  <input type="text" placeholder="Enter project name" className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <textarea placeholder="Enter description" className="input" rows="3" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Status</label>
                  <select className="input" value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>
                    {(editingProject ? PROJECT_STATUSES.EDIT : PROJECT_STATUSES.CREATE).map(status => (
                      <option key={status} value={status}>{getProjectStatusLabel(status)}</option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Date</label>
                    <input type="date" className="input" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} max={formData.endDate || undefined} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">End Date</label>
                    <input type="date" className="input" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} min={formData.startDate || undefined} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => { setShowModal(false); setError('') }} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <span className="flex items-center gap-2"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving...</span>
                  ) : (editingProject ? 'Update Project' : 'Create Project')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
