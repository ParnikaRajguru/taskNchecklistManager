import { useState, useEffect } from 'react'
import { shiftService } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Shifts() {
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingShift, setEditingShift] = useState(null)
  const { user } = useAuth()
  const [formData, setFormData] = useState({ name: '', shiftType: 'MORNING', startTime: '', endTime: '', active: true })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const res = await shiftService.getAll()
      setShifts(res.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingShift) await shiftService.update(editingShift.id, formData)
      else await shiftService.create(formData)
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
      active: shift.active
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this shift?')) {
      try { await shiftService.delete(id); loadData() }
      catch (err) { alert('Failed to delete') }
    }
  }

  const resetForm = () => setFormData({ name: '', shiftType: 'MORNING', startTime: '', endTime: '', active: true })
  const isManager = ['SUPER_ADMIN', 'PROJECT_MANAGER', 'MANAGER'].includes(user?.role)

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Shifts</h1>
        {isManager && <button onClick={() => { resetForm(); setEditingShift(null); setShowModal(true) }} className="btn btn-primary">Add Shift</button>}
      </div>

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
            <p className="text-sm text-gray-500 mb-4">Users: {shift.userCount || 0}</p>
            <div className="flex gap-2">
              {isManager && <><button onClick={() => handleEdit(shift)} className="btn btn-secondary text-sm">Edit</button><button onClick={() => handleDelete(shift.id)} className="btn btn-danger text-sm">Delete</button></>}
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">{editingShift ? 'Edit' : 'Create'} Shift</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Shift Name" className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
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