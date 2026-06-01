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
    } finally { setSubmitting(false) }
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

  if (loading) return <div className="text-center py-8"><div className="skeleton h-8 w-48 mx-auto mb-4" /><div className="grid grid-cols-3 gap-4"><div className="skeleton h-40 rounded-xl" /><div className="skeleton h-40 rounded-xl" /><div className="skeleton h-40 rounded-xl" /></div></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Shifts</h1>
          <p className="text-sm text-slate-500 mt-1">Configure and manage shifts</p>
        </div>
        {isManager && (
          <button onClick={() => { resetForm(); setEditingShift(null); setShowModal(true) }} className="btn btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Add Shift
          </button>
        )}
      </div>

      {shifts.length === 0 ? (
        <div className="empty-state card py-12">
          <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="empty-state-text">No shifts configured yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {shifts.map((shift) => (
            <div key={shift.id} className="card p-5 hover:shadow-soft-md transition-shadow">
              <div className="flex items-start justify-between gap-2 mb-3">
                <h3 className="font-semibold text-slate-900">{shift.name}</h3>
                <span className={`badge ${shift.shiftType === 'MORNING' ? 'badge-yellow' : shift.shiftType === 'EVENING' ? 'badge-blue' : 'badge-gray'} shrink-0`}>
                  {shift.shiftType}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-600 mb-3">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                {shift.startTime && shift.endTime ? `${shift.startTime} - ${shift.endTime}` : 'Time not set'}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-4">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Team: {shift.teamName || 'None'}
              </div>
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${shift.active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${shift.active ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                  {shift.active ? 'Active' : 'Inactive'}
                </span>
              </div>
              {isManager && (
                <div className="flex gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button onClick={() => handleEdit(shift)} className="btn btn-ghost text-xs px-3 py-1.5">Edit</button>
                  <button onClick={() => handleDelete(shift.id)} className="btn btn-ghost text-xs px-3 py-1.5 text-rose-600 hover:bg-rose-50">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); setError('') }}}>
          <div className="modal-content max-w-md" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{editingShift ? 'Edit' : 'Create'} Shift</h3>
              <button onClick={() => { setShowModal(false); setError('') }} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {error && <div className="mx-6 mt-4 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700"><svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Shift Name</label>
                  <input type="text" placeholder="Enter shift name" className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Team</label>
                  <select className="input" value={formData.teamId} onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}>
                    <option value="">Select Team</option>
                    {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Shift Type</label>
                  <select className="input" value={formData.shiftType} onChange={(e) => setFormData({ ...formData, shiftType: e.target.value })}>
                    <option value="MORNING">Morning</option>
                    <option value="EVENING">Evening</option>
                    <option value="NIGHT">Night</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Start Time</label>
                    <input type="time" className="input" value={formData.startTime} onChange={(e) => setFormData({ ...formData, startTime: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">End Time</label>
                    <input type="time" className="input" value={formData.endTime} onChange={(e) => setFormData({ ...formData, endTime: e.target.value })} />
                  </div>
                </div>
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input type="checkbox" checked={formData.active} onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
                  <span className="text-sm font-medium text-slate-700">Active</span>
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => { setShowModal(false); setError('') }} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <span className="flex items-center gap-2"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving...</span>
                  ) : (editingShift ? 'Update Shift' : 'Create Shift')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
