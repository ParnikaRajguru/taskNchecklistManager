import { useState, useEffect } from 'react'
import { checklistService, shiftService, teamService, userService } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Checklists() {
  const [checklists, setChecklists] = useState([])
  const [shifts, setShifts] = useState([])
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingChecklist, setEditingChecklist] = useState(null)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const [formData, setFormData] = useState({ title: '', description: '', shiftId: '', teamId: '', items: [] })
  const [newItem, setNewItem] = useState({ title: '', description: '', assignedToId: '' })
  const [teamUsers, setTeamUsers] = useState([])

  const isAdminOrManager = ['SUPER_ADMIN', 'MANAGER'].includes(user?.role)
  const isTeamLead = user?.role === 'TEAM_LEAD'
  const isStaff = ['STAFF', 'DEVELOPER', 'TESTER'].includes(user?.role)
  const userTeamId = user?.teamId

  useEffect(() => { loadData() }, [])

  useEffect(() => {
    if (!showModal && !showEditModal) { setTeamUsers([]); return }
    const formTeamId = formData.teamId
    const targetTeamId = formTeamId || userTeamId
    if (targetTeamId) {
      userService.getByTeam(targetTeamId).then(res => {
        const filteredUsers = res.data.filter(u => u.id !== user?.id && u.role !== 'SUPER_ADMIN')
        setTeamUsers(filteredUsers)
      }).catch(() => setTeamUsers([]))
    } else { setTeamUsers([]) }
  }, [formData.teamId, user?.id, userTeamId, showModal, showEditModal])

  const loadData = async () => {
    try {
      const [checklistsRes, shiftsRes, teamsRes] = await Promise.all([
        checklistService.getAll(), shiftService.getAll(), teamService.getAll()
      ])
      setChecklists(checklistsRes.data)
      setShifts(shiftsRes.data)
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const data = { ...formData, shiftId: formData.shiftId || null, teamId: isAdminOrManager ? (formData.teamId || null) : userTeamId }
      await checklistService.create(data)
      setShowModal(false)
      resetForm()
      loadData()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally { setSubmitting(false) }
  }

  const handleComplete = async (itemId, completed) => {
    try {
      if (completed) await checklistService.uncompleteItem(itemId)
      else await checklistService.completeItem(itemId)
      loadData()
    } catch (err) { alert('Failed to update item') }
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this checklist?')) {
      try { await checklistService.delete(id); loadData() }
      catch (err) {
        const msg = err.response?.data?.message || 'Failed to delete'
        alert(msg)
      }
    }
  }

  const handleEdit = (checklist) => {
    const targetTeamId = checklist.teamId || userTeamId
    userService.getByTeam(targetTeamId).then(res => {
      const filteredUsers = res.data.filter(u => u.id !== user?.id && u.role !== 'SUPER_ADMIN')
      setTeamUsers(filteredUsers)
    }).catch(() => setTeamUsers([]))
    setFormData({
      title: checklist.title,
      description: checklist.description || '',
      shiftId: checklist.shiftId || '',
      teamId: checklist.teamId || '',
      items: checklist.items?.map(item => ({ title: item.title, description: item.description || '', assignedToId: item.assignedToId || '' })) || []
    })
    setEditingChecklist(checklist)
    setShowEditModal(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const data = { ...formData, shiftId: formData.shiftId || null, teamId: isAdminOrManager ? (formData.teamId || null) : userTeamId }
      await checklistService.update(editingChecklist.id, data)
      setShowEditModal(false)
      setEditingChecklist(null)
      resetForEdit()
      loadData()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally { setSubmitting(false) }
  }

  const addItem = () => {
    if (!newItem.title) return
    if (newItem.assignedToId && Number(newItem.assignedToId) === user?.id) {
      setError('You cannot assign an item to yourself'); return
    }
    setFormData({ ...formData, items: [...formData.items, { ...newItem, assignedToId: newItem.assignedToId || null }] })
    setNewItem({ title: '', description: '', assignedToId: '' })
  }

  const removeItem = (index) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) })
  }

  const canCreate = ['SUPER_ADMIN', 'MANAGER', 'TEAM_LEAD', 'STAFF', 'DEVELOPER', 'TESTER'].includes(user?.role)
  const canDelete = ['SUPER_ADMIN', 'MANAGER'].includes(user?.role)

  const resetForm = () => {
    const initial = { title: '', description: '', shiftId: '', teamId: '', items: [] }
    if (!isAdminOrManager && userTeamId) initial.teamId = userTeamId
    setFormData(initial)
    setNewItem({ title: '', description: '', assignedToId: '' })
  }

  const resetForEdit = () => {
    setFormData({ title: '', description: '', shiftId: '', teamId: '', items: [] })
    setNewItem({ title: '', description: '', assignedToId: '' })
  }

  const availableTeams = user?.role === 'SUPER_ADMIN'
    ? teams
    : user?.role === 'MANAGER'
      ? teams.filter(t => t.managerId === user.id)
      : teams.filter(t => t.id === userTeamId)

  const getFilteredTeamUsers = () => {
    if (!user) return []
    const role = user.role
    const selfId = user.id
    const isStaffLevel = (r) => ['STAFF', 'DEVELOPER', 'TESTER'].includes(r)
    return teamUsers.filter(u => {
      if (u.id === selfId) return false
      if (role === 'SUPER_ADMIN') return true
      if (role === 'MANAGER') return u.role !== 'SUPER_ADMIN' && u.role !== 'MANAGER'
      if (role === 'TEAM_LEAD') return isStaffLevel(u.role)
      if (isStaffLevel(role)) return isStaffLevel(u.role)
      return false
    })
  }

  const filteredChecklists = checklists.filter(checklist => {
    if (isAdminOrManager) return true
    if (isTeamLead || isStaff) return checklist.teamId === userTeamId
    return false
  })

  const canEditChecklist = (checklist) => {
    if (isAdminOrManager) return true
    if (isTeamLead) return checklist.teamId === userTeamId
    if (isStaff) return checklist.createdById === user?.id
    return false
  }

  const getUserTeamName = () => { const team = teams.find(t => t.id === userTeamId); return team?.name || '' }
  const getUserTeamNameDisplay = () => getUserTeamName() || 'Your Team'

  if (loading) return <div className="text-center py-8"><div className="skeleton h-8 w-48 mx-auto mb-4" /><div className="space-y-4"><div className="skeleton h-32 w-full rounded-xl" /><div className="skeleton h-32 w-full rounded-xl" /></div></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Checklists</h1>
          <p className="text-sm text-slate-500 mt-1">Create and manage checklists</p>
        </div>
        {canCreate && (
          <button onClick={() => { resetForm(); setShowModal(true); setError('') }} className="btn btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Create Checklist
          </button>
        )}
      </div>

      {error && <div className="flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700"><svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>{error}</div>}

      {filteredChecklists.length === 0 ? (
        <div className="empty-state card py-12">
          <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <p className="empty-state-text">No checklists available for you.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredChecklists.map((checklist) => {
            const assignedUsers = [...new Set(checklist.items?.filter(i => i.assignedToName).map(i => i.assignedToName) || [])]
            return (
              <div key={checklist.id} className="card p-5 hover:shadow-soft-md transition-shadow">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-900">{checklist.title}</h3>
                      <span className="text-xs text-slate-400">by {checklist.createdByName || 'Unknown'}</span>
                    </div>
                    {checklist.description && <p className="text-sm text-slate-500 mt-1">{checklist.description}</p>}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {checklist.shiftName && <span className="badge badge-blue">{checklist.shiftName}</span>}
                      {checklist.teamName && <span className="badge badge-green">{checklist.teamName}</span>}
                    </div>
                    {checklist.progressPercentage !== undefined && (
                      <div className="mt-3 flex items-center gap-2 max-w-xs">
                        <div className="flex-1 bg-slate-200 rounded-full h-2 overflow-hidden">
                          <div className="bg-emerald-500 rounded-full h-2 transition-all duration-500" style={{ width: `${checklist.progressPercentage}%` }} />
                        </div>
                        <span className="text-xs text-slate-500">{checklist.progressPercentage}%</span>
                      </div>
                    )}
                    {assignedUsers.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {assignedUsers.map((name, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">{name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {canEditChecklist(checklist) && (
                      <button onClick={() => handleEdit(checklist)} className="btn btn-ghost text-xs px-2 py-1">Edit</button>
                    )}
                    {canDelete && (
                      <button onClick={() => handleDelete(checklist.id)} className="btn btn-ghost text-xs px-2 py-1 text-rose-600 hover:bg-rose-50">Delete</button>
                    )}
                  </div>
                </div>
                <div className="space-y-1.5">
                  {checklist.items?.map((item) => (
                    <div key={item.id} className={`checklist-item ${item.completed ? 'completed' : ''}`}>
                      <input type="checkbox" checked={item.completed} onChange={() => handleComplete(item.id, item.completed)}
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-700 font-medium'}`}>{item.title}</p>
                        {item.description && <p className="text-xs text-slate-400">{item.description}</p>}
                      </div>
                      {item.assignedToName && (
                        <span className="badge badge-blue text-xs shrink-0">{item.assignedToName}</span>
                      )}
                    </div>
                  ))}
                  {(!checklist.items || checklist.items.length === 0) && (
                    <p className="text-slate-400 text-xs text-center py-3">No items in this checklist</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); setError('') }}}>
          <div className="modal-content max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Create Checklist</h3>
              <button onClick={() => { setShowModal(false); setError('') }} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {error && <div className="mx-6 mt-4 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700"><svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                  <input type="text" placeholder="Enter checklist title" className="input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <textarea placeholder="Enter description" className="input" rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Shift</label>
                    <select className="input" value={formData.shiftId} onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}>
                      <option value="">Select Shift</option>
                      {shifts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  {isAdminOrManager ? (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Team</label>
                      <select className="input" value={formData.teamId} onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}>
                        <option value="">Select Team</option>
                        {availableTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Team</label>
                      <input type="text" className="input bg-slate-50 text-slate-600" value={getUserTeamNameDisplay()} disabled />
                    </div>
                  )}
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-medium text-slate-900 mb-3">Checklist Items</h4>
                  <div className="space-y-2 mb-3">
                    {formData.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span className="text-sm text-slate-700 truncate">{item.title}</span>
                        </div>
                        <button type="button" onClick={() => removeItem(idx)} className="text-rose-500 hover:text-rose-700 text-sm font-medium shrink-0">Remove</button>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input type="text" placeholder="Item title" className="input" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
                    <select className="input" value={newItem.assignedToId} onChange={(e) => setNewItem({ ...newItem, assignedToId: e.target.value })}>
                      <option value="">Assign to</option>
                      {getFilteredTeamUsers().map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role})</option>)}
                    </select>
                  </div>
                  <button type="button" onClick={addItem} className="btn btn-secondary w-full">Add Item</button>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => { setShowModal(false); setError('') }} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <span className="flex items-center gap-2"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Creating...</span>
                  ) : 'Create Checklist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowEditModal(false); setEditingChecklist(null); setError('') }}}>
          <div className="modal-content max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Edit Checklist</h3>
              <button onClick={() => { setShowEditModal(false); setEditingChecklist(null); setError(''); resetForEdit(); setTeamUsers([]) }} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {error && <div className="mx-6 mt-4 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700"><svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>{error}</div>}
            <form onSubmit={handleUpdate}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                  <input type="text" placeholder="Enter checklist title" className="input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <textarea placeholder="Enter description" className="input" rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Shift</label>
                    <select className="input" value={formData.shiftId} onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}>
                      <option value="">Select Shift</option>
                      {shifts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  {isAdminOrManager ? (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Team</label>
                      <select className="input" value={formData.teamId} onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}>
                        <option value="">Select Team</option>
                        {availableTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">Team</label>
                      <input type="text" className="input bg-slate-50 text-slate-600" value={getUserTeamNameDisplay()} disabled />
                    </div>
                  )}
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-medium text-slate-900 mb-3">Checklist Items</h4>
                  <div className="space-y-2 mb-3">
                    {formData.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span className="text-sm text-slate-700 truncate">{item.title}</span>
                        </div>
                        <button type="button" onClick={() => removeItem(idx)} className="text-rose-500 hover:text-rose-700 text-sm font-medium shrink-0">Remove</button>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input type="text" placeholder="Item title" className="input" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
                    <select className="input" value={newItem.assignedToId} onChange={(e) => setNewItem({ ...newItem, assignedToId: e.target.value })}>
                      <option value="">Assign to</option>
                      {getFilteredTeamUsers().map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role})</option>)}
                    </select>
                  </div>
                  <button type="button" onClick={addItem} className="btn btn-secondary w-full">Add Item</button>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => { setShowEditModal(false); setEditingChecklist(null); setError(''); resetForEdit(); setTeamUsers([]) }} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <span className="flex items-center gap-2"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Updating...</span>
                  ) : 'Update Checklist'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
