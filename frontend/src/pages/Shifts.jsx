import { useState, useEffect } from 'react'
import { shiftService, projectService, teamService } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Shifts() {
  const [shifts, setShifts] = useState([])
  const [projects, setProjects] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingShift, setEditingShift] = useState(null)
  const { user } = useAuth()
  const [formData, setFormData] = useState({ name: '', shiftType: 'MORNING', startTime: '', endTime: '', active: true, projectId: '', teamId: '' })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const projectsPromise = projectService.getAll()
      const teamsPromise = teamService.getAll()
      const [res, projectsRes, teamsRes] = await Promise.all([shiftService.getAll(), projectsPromise, teamsPromise])
      setShifts(res.data)
      setProjects(projectsRes.data)
      setTeams(teamsRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = { ...formData, projectId: formData.projectId || null, teamId: formData.teamId || null }
      if (editingShift) await shiftService.update(editingShift.id, data)
      else await shiftService.create(data)
      setShowModal(false)
      setEditingShift(null)
      resetForm()
      loadData()
    } catch (err) { alert(err.response?.data?.message || 'Failed to save') }
  }

  const handleEdit = (shift) => {
    setEditingShift(shift)
    setFormData({
      name: shift.name,
      shiftType: shift.shiftType,
      startTime: shift.startTime || '',
      endTime: shift.endTime || '',
      active: shift.active,
      projectId: shift.projectId || '',
      teamId: shift.teamId || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this shift?')) {
      try { await shiftService.delete(id); loadData() }
      catch (err) { alert('Failed to delete') }
    }
  }

  const resetForm = () => setFormData({ name: '', shiftType: 'MORNING', startTime: '', endTime: '', active: true, projectId: '', teamId: '' })
  const isManager = ['SUPER_ADMIN', 'PROJECT_MANAGER', 'MANAGER'].includes(user?.role)

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Shifts</h1>
        {isManager && <button onClick={() => { resetForm(); setEditingShift(null); setShowModal(true) }} className="btn btn-primary">Add Shift</button>}
      </div>

      {shifts.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500">No shifts configured yet.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {shifts.map((shift) => (
          <div key={shift.id} className="card">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{shift.name}</h3>
              <span className={`badge ${shift.shiftType === 'MORNING' ? 'badge-yellow' : shift.shiftType === 'EVENING' ? 'badge-blue' : 'badge-gray'}`}>
                {shift.shiftType}
              </span>
            </div>
            <p className="text-gray-500 text-sm mb-2">
              {shift.startTime && shift.endTime ? `${shift.startTime} - ${shift.endTime}` : 'Time not set'}
            </p>
            <div className="text-xs text-gray-500 mb-3">
              <p>Project: {shift.projectName || 'None'}</p>
              <p>Team: {shift.teamName || 'None'}</p>
            </div>
            <div className="flex justify-between text-sm text-gray-500 mb-3">
              <span>Users: {shift.userCount || 0}</span>
              <span>Tasks: {shift.taskCount || 0}</span>
              <span>Checklists: {shift.checklistCount || 0}</span>
            </div>
            <div className="flex gap-2">
              {isManager && <><button onClick={() => handleEdit(shift)} className="btn btn-secondary text-sm">Edit</button><button onClick={() => handleDelete(shift.id)} className="btn btn-danger text-sm">Delete</button></>}
            </div>
          </div>
        ))}
      </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{editingShift ? 'Edit' : 'Create'} Shift</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Shift Name" className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              <div className="grid grid-cols-2 gap-4">
                <select className="input" value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}>
                  <option value="">Select Project</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
                <select className="input" value={formData.teamId} onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}>
                  <option value="">Select Team</option>
                  {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <select className="input" value={formData.shiftType} onChange={(e) => setFormData({ ...formData, shiftType: e.target.value })}>
                <option value="MORNING">Morning</option>
                <option value="EVENING">Evening</option>
                <option value="NIGHT">Night</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <input type="time" className="input" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
                <input type="time" className="input" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} />
                <span>Active</span>
              </label>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary flex-1">{editingShift ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
