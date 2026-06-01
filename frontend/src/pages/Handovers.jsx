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
    try { await handoverService.resolve(id); loadData() }
    catch (err) { alert('Failed to resolve') }
  }

  const handleAcknowledge = async (id) => {
    try { await handoverService.acknowledge(id); loadData() }
    catch (err) { alert('Failed to acknowledge') }
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

  const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(user?.role)

  if (loading) return <div className="text-center py-8"><div className="skeleton h-8 w-48 mx-auto mb-4" /><div className="space-y-4"><div className="skeleton h-28 w-full rounded-xl" /><div className="skeleton h-28 w-full rounded-xl" /></div></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Shift Handovers</h1>
          <p className="text-sm text-slate-500 mt-1">Manage shift transitions and handovers</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true) }} className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
          Create Handover
        </button>
      </div>

      {handovers.length === 0 ? (
        <div className="empty-state card py-12">
          <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" /></svg>
          <p className="empty-state-text">No handovers found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {handovers.map((handover) => (
            <div key={handover.id} className="card p-5 hover:shadow-soft-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3 className="font-semibold text-slate-900">{handover.title}</h3>
                    {handover.priority && <span className={`badge ${getPriorityColor(handover.priority)}`}>{handover.priority}</span>}
                  </div>
                  <p className="text-sm text-slate-500 mt-1">
                    <span className="font-medium">From:</span> {handover.fromShiftName || 'None'} <span className="text-slate-300">→</span> <span className="font-medium">To:</span> {handover.toShiftName || 'None'}
                  </p>
                  {(handover.assignedTeamName || handover.receivingTeamName) && (
                    <p className="text-sm text-slate-500">
                      <span className="font-medium">Team:</span> {handover.assignedTeamName || 'None'} <span className="text-slate-300">→</span> {handover.receivingTeamName || 'None'}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <span className={`badge ${handover.resolved ? 'badge-green' : 'badge-yellow'}`}>
                    {handover.resolved ? 'Resolved' : 'Pending'}
                  </span>
                  {handover.acknowledged && <span className="badge badge-blue">Acknowledged</span>}
                  <button onClick={() => setShowDetails(handover)} className="btn btn-ghost text-xs px-2 py-1">View</button>
                  {!handover.resolved && <button onClick={() => handleResolve(handover.id)} className="btn btn-ghost text-xs px-2 py-1 text-emerald-600 hover:bg-emerald-50">Resolve</button>}
                  {handover.resolved && !handover.acknowledged && <button onClick={() => handleAcknowledge(handover.id)} className="btn btn-ghost text-xs px-2 py-1 text-violet-600 hover:bg-violet-50">Acknowledge</button>}
                  {isManager && <button onClick={() => handleDelete(handover.id)} className="btn btn-ghost text-xs px-2 py-1 text-rose-600 hover:bg-rose-50">Delete</button>}
                </div>
              </div>
              {handover.pendingWork && (
                <p className="text-sm text-slate-600 mt-3 line-clamp-2">{handover.pendingWork}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
          <div className="modal-content max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Create Handover</h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                  <input type="text" placeholder="Enter handover title" className="input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Priority</label>
                  <select className="input" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value })}>
                    <option value="LOW">Low Priority</option>
                    <option value="MEDIUM">Medium Priority</option>
                    <option value="HIGH">High Priority</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">From Shift</label>
                    <select className="input" value={formData.fromShiftId} onChange={(e) => setFormData({ ...formData, fromShiftId: e.target.value })}>
                      <option value="">From Shift</option>
                      {shifts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">To Shift</label>
                    <select className="input" value={formData.toShiftId} onChange={(e) => setFormData({ ...formData, toShiftId: e.target.value })}>
                      <option value="">To Shift</option>
                      {shifts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Assigned Team</label>
                    <select className="input" value={formData.assignedTeamId} onChange={(e) => setFormData({ ...formData, assignedTeamId: e.target.value })}>
                      <option value="">Assigned Team</option>
                      {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Receiving Team</label>
                    <select className="input" value={formData.receivingTeamId} onChange={(e) => setFormData({ ...formData, receivingTeamId: e.target.value })}>
                      <option value="">Receiving Team</option>
                      {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Completed Work</label>
                  <textarea placeholder="What was completed?" className="input" rows="2" value={formData.completedWork} onChange={(e) => setFormData({ ...formData, completedWork: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Pending Work</label>
                  <textarea placeholder="What is still pending?" className="input" rows="2" value={formData.pendingWork} onChange={(e) => setFormData({ ...formData, pendingWork: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Blockers / Issues</label>
                  <textarea placeholder="Any blockers or issues?" className="input" rows="2" value={formData.blockers} onChange={(e) => setFormData({ ...formData, blockers: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Next Shift Instructions</label>
                  <textarea placeholder="Instructions for the next shift" className="input" rows="2" value={formData.nextShiftInstructions} onChange={(e) => setFormData({ ...formData, nextShiftInstructions: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Handover</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetails && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowDetails(null) }}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex items-center justify-between">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-semibold text-slate-900">{showDetails.title}</h3>
                {showDetails.priority && <span className={`badge ${getPriorityColor(showDetails.priority)} mt-1`}>{showDetails.priority}</span>}
              </div>
              <button onClick={() => setShowDetails(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            <div className="modal-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 rounded-xl p-4">
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">From → To</p>
                  <p className="text-sm text-slate-700 mt-1">{showDetails.fromShiftName || 'None'} → {showDetails.toShiftName || 'None'}</p>
                </div>
                {(showDetails.assignedTeamName || showDetails.receivingTeamName) && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Teams</p>
                    <p className="text-sm text-slate-700 mt-1">{showDetails.assignedTeamName || 'None'} → {showDetails.receivingTeamName || 'None'}</p>
                  </div>
                )}
              </div>
              {showDetails.completedWork && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Completed Work</h4>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-xl p-4">{showDetails.completedWork || 'None'}</p>
                </div>
              )}
              {showDetails.pendingWork && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Pending Work</h4>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap bg-amber-50 rounded-xl p-4">{showDetails.pendingWork || 'None'}</p>
                </div>
              )}
              {showDetails.blockers && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Blockers</h4>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap bg-rose-50 rounded-xl p-4">{showDetails.blockers || 'None'}</p>
                </div>
              )}
              {showDetails.nextShiftInstructions && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Next Shift Instructions</h4>
                  <p className="text-sm text-slate-700 whitespace-pre-wrap bg-primary-50 rounded-xl p-4">{showDetails.nextShiftInstructions || 'None'}</p>
                </div>
              )}
              <div className="flex gap-2">
                <span className={`badge ${showDetails.resolved ? 'badge-green' : 'badge-yellow'}`}>{showDetails.resolved ? 'Resolved' : 'Pending'}</span>
                <span className={`badge ${showDetails.acknowledged ? 'badge-blue' : 'badge-gray'}`}>{showDetails.acknowledged ? 'Acknowledged' : 'Not Acknowledged'}</span>
              </div>
              <div className="text-xs text-slate-500 pt-2 border-t border-slate-100">
                Created by: {showDetails.createdByName} on {new Date(showDetails.createdAt).toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
