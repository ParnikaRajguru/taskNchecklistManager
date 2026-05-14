import { useState, useEffect } from 'react'
import { shiftService, teamService } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Shifts() {
  const [shifts, setShifts] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingShift, setEditingShift] = useState(null)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const [formData, setFormData] = useState({ name: '', shiftType: 'MORNING', startTime: '', endTime: '', active: true, teamId: '' })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const teamsPromise = teamService.getAll()
      const [res, teamsRes] = await Promise.all([shiftService.getAll(), teamsPromise])
      setShifts(res.data)
      setTeams(teamsRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const getErrorMessage = (err) => {
    if (err.response?.data?.errors) {
      return Object.values(err.response.data.errors).join(', ')
    }
    return err.response?.data?.message || err.message || 'Failed to save'
  }

  const validateTimes = () => {
    if (formData.startTime && formData.endTime && formData.startTime >= formData.endTime) {
      setError('End time must be after start time')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (!validateTimes()) return
    setSubmitting(true)
    try {
      const data = { ...formData, teamId: formData.teamId || null }
      if (editingShift) await shiftService.update(editingShift.id, data)
      else await shiftService.create(data)
      setShowModal(false)
      setEditingShift(null)
      resetForm()
      loadData()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (shift) => {
    setEditingShift(shift)
    setFormData({
      name: shift.name,
      shiftType: shift.shiftType,
      startTime: shift.startTime || '',
      endTime: shift.endTime || '',
      active: shift.active,
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

  const resetForm = () => setFormData({ name: '', shiftType: 'MORNING', startTime: '', endTime: '', active: true, teamId: '' })
  const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(user?.role)

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
              <p>Team: {shift.teamName || 'None'}</p>
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
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Shift Name" className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              <select className="input" value={formData.teamId} onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}>
                <option value="">Select Team</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <select className="input" value={formData.shiftType} onChange={(e) => setFormData({ ...formData, shiftType: e.target.value })}>
                <option value="MORNING">Morning</option>
                <option value="EVENING">Evening</option>
                <option value="NIGHT">Night</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                  <input type="time" className="input" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">End Time</label>
                  <input type="time" className="input" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
                </div>
              </div>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })} />
                <span className="text-sm">Active</span>
              </label>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>{submitting ? 'Saving...' : (editingShift ? 'Update' : 'Create')}</button>
                <button type="button" onClick={() => { setShowModal(false); setError('') }} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
