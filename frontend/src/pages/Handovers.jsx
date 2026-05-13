import { useState, useEffect } from 'react'
import { handoverService, shiftService, teamService } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Handovers() {
  const [handovers, setHandovers] = useState([])
  const [shifts, setShifts] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetails, setShowDetails] = useState(null)
  const { user } = useAuth()
  const [formData, setFormData] = useState({
    title: '', completedWork: '', pendingWork: '', blockers: '',
    nextShiftInstructions: '', fromShiftId: '', toShiftId: '',
    assignedTeamId: '', receivingTeamId: '', priority: 'MEDIUM'
  })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [handoversRes, shiftsRes, teamsRes] = await Promise.all([
        handoverService.getAll(), shiftService.getAll(), teamService.getAll()
      ])
      setHandovers(handoversRes.data)
      setShifts(shiftsRes.data)
      setTeams(teamsRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        fromShiftId: formData.fromShiftId || null,
        toShiftId: formData.toShiftId || null,
        assignedTeamId: formData.assignedTeamId || null,
        receivingTeamId: formData.receivingTeamId || null
      }
      await handoverService.create(data)
      setShowModal(false)
      resetForm()
      loadData()
    } catch (err) { alert(err.response?.data?.message || 'Failed to create handover') }
  }

  const handleResolve = async (id) => {
    try {
      await handoverService.resolve(id)
      loadData()
    } catch (err) { alert('Failed to resolve') }
  }

  const handleAcknowledge = async (id) => {
    try {
      await handoverService.acknowledge(id)
      loadData()
    } catch (err) { alert('Failed to acknowledge') }
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this handover?')) {
      try { await handoverService.delete(id); loadData() }
      catch (err) { alert('Failed to delete') }
    }
  }

  const resetForm = () => setFormData({
    title: '', completedWork: '', pendingWork: '', blockers: '',
    nextShiftInstructions: '', fromShiftId: '', toShiftId: '',
    assignedTeamId: '', receivingTeamId: '', priority: 'MEDIUM'
  })

  const getPriorityColor = (priority) => {
    const colors = { LOW: 'badge-green', MEDIUM: 'badge-yellow', HIGH: 'badge-orange', CRITICAL: 'badge-red' }
    return colors[priority] || 'badge-gray'
  }

  const isManager = ['SUPER_ADMIN', 'PROJECT_MANAGER', 'MANAGER'].includes(user?.role)

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Shift Handovers</h1>
        <button onClick={() => { resetForm(); setShowModal(true) }} className="btn btn-primary">Create Handover</button>
      </div>

      {handovers.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500">No handovers found.</p>
        </div>
      ) : (
      <div className="space-y-4">
        {handovers.map((handover) => (
          <div key={handover.id} className="card">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="font-semibold text-lg">{handover.title}</h3>
                <div className="flex gap-2 mt-1">
                  {handover.priority && <span className={`badge ${getPriorityColor(handover.priority)}`}>{handover.priority}</span>}
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  From: {handover.fromShiftName || 'None'} → To: {handover.toShiftName || 'None'}
                </p>
                {(handover.assignedTeamName || handover.receivingTeamName) && (
                  <p className="text-sm text-gray-500">
                    Team: {handover.assignedTeamName || 'None'} → {handover.receivingTeamName || 'None'}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`badge ${handover.resolved ? 'badge-green' : 'badge-yellow'}`}>
                  {handover.resolved ? 'Resolved' : 'Pending'}
                </span>
                {handover.acknowledged && <span className="badge badge-blue">Acknowledged</span>}
                <button onClick={() => setShowDetails(handover)} className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                {!handover.resolved && <button onClick={() => handleResolve(handover.id)} className="text-green-600 hover:text-green-800 text-sm">Resolve</button>}
                {handover.resolved && !handover.acknowledged && <button onClick={() => handleAcknowledge(handover.id)} className="text-purple-600 hover:text-purple-800 text-sm">Acknowledge</button>}
                {isManager && <button onClick={() => handleDelete(handover.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>}
              </div>
            </div>
            <p className="text-sm text-gray-600 line-clamp-2">{handover.pendingWork}</p>
          </div>
        ))}
      </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create Handover</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Title" className="input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              <div className="grid grid-cols-2 gap-4">
                <select className="input" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select className="input" value={formData.fromShiftId} onChange={(e) => setFormData({ ...formData, fromShiftId: e.target.value })}>
                  <option value="">From Shift</option>
                  {shifts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select className="input" value={formData.toShiftId} onChange={(e) => setFormData({ ...formData, toShiftId: e.target.value })}>
                  <option value="">To Shift</option>
                  {shifts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select className="input" value={formData.assignedTeamId} onChange={(e) => setFormData({ ...formData, assignedTeamId: e.target.value })}>
                  <option value="">Assigned Team</option>
                  {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select className="input" value={formData.receivingTeamId} onChange={(e) => setFormData({ ...formData, receivingTeamId: e.target.value })}>
                  <option value="">Receiving Team</option>
                  {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <textarea placeholder="Completed Work" className="input" rows="2" value={formData.completedWork} onChange={(e) => setFormData({ ...formData, completedWork: e.target.value })} />
              <textarea placeholder="Pending Work" className="input" rows="2" value={formData.pendingWork} onChange={(e) => setFormData({ ...formData, pendingWork: e.target.value })} />
              <textarea placeholder="Blockers/Issues" className="input" rows="2" value={formData.blockers} onChange={(e) => setFormData({ ...formData, blockers: e.target.value })} />
              <textarea placeholder="Next Shift Instructions" className="input" rows="2" value={formData.nextShiftInstructions} onChange={(e) => setFormData({ ...formData, nextShiftInstructions: e.target.value })} />
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary flex-1">Create</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetails && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold">{showDetails.title}</h3>
                {showDetails.priority && <span className={`badge ${getPriorityColor(showDetails.priority)} mt-1`}>{showDetails.priority}</span>}
              </div>
              <button onClick={() => setShowDetails(null)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-700">From → To</h4>
                <p className="text-gray-600">{showDetails.fromShiftName || 'None'} → {showDetails.toShiftName || 'None'}</p>
              </div>
              {(showDetails.assignedTeamName || showDetails.receivingTeamName) && (
                <div>
                  <h4 className="font-medium text-gray-700">Teams</h4>
                  <p className="text-gray-600">
                    Assigned: {showDetails.assignedTeamName || 'None'} | Receiving: {showDetails.receivingTeamName || 'None'}
                  </p>
                </div>
              )}
              <div>
                <h4 className="font-medium text-gray-700">Completed Work</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{showDetails.completedWork || 'None'}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Pending Work</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{showDetails.pendingWork || 'None'}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Blockers</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{showDetails.blockers || 'None'}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Next Shift Instructions</h4>
                <p className="text-gray-600 whitespace-pre-wrap">{showDetails.nextShiftInstructions || 'None'}</p>
              </div>
              <div className="flex gap-2">
                <span className={`badge ${showDetails.resolved ? 'badge-green' : 'badge-yellow'}`}>
                  {showDetails.resolved ? 'Resolved' : 'Pending'}
                </span>
                <span className={`badge ${showDetails.acknowledged ? 'badge-blue' : 'badge-gray'}`}>
                  {showDetails.acknowledged ? 'Acknowledged' : 'Not Acknowledged'}
                </span>
              </div>
              <div className="text-sm text-gray-500">
                Created by: {showDetails.createdByName} on {new Date(showDetails.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
