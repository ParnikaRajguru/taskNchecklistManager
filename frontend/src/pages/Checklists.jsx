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
    if (!showModal && !showEditModal) {
      setTeamUsers([])
      return
    }
    const formTeamId = formData.teamId
    const targetTeamId = formTeamId || userTeamId
    if (targetTeamId) {
      userService.getByTeam(targetTeamId).then(res => {
        const filteredUsers = res.data.filter(u => u.id !== user?.id && u.role !== 'SUPER_ADMIN')
        setTeamUsers(filteredUsers)
      }).catch(() => setTeamUsers([]))
    } else {
      setTeamUsers([])
    }
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
    } finally {
      setSubmitting(false)
    }
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
      items: checklist.items?.map(item => ({
        title: item.title,
        description: item.description || '',
        assignedToId: item.assignedToId || ''
      })) || []
    })
    setEditingChecklist(checklist)
    setShowEditModal(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const data = {
        ...formData,
        shiftId: formData.shiftId || null,
        teamId: isAdminOrManager ? (formData.teamId || null) : userTeamId
      }
      await checklistService.update(editingChecklist.id, data)
      setShowEditModal(false)
      setEditingChecklist(null)
      resetForEdit()
      loadData()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const addItem = () => {
    if (!newItem.title) return
    if (newItem.assignedToId && Number(newItem.assignedToId) === user?.id) {
      setError('You cannot assign an item to yourself')
      return
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
    if (!isAdminOrManager && userTeamId) {
      initial.teamId = userTeamId
    }
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
      if (role === 'MANAGER') {
        return u.role !== 'SUPER_ADMIN' && u.role !== 'MANAGER'
      }
      if (role === 'TEAM_LEAD') {
        return isStaffLevel(u.role)
      }
      if (isStaffLevel(role)) {
        return isStaffLevel(u.role)
      }
      return false
    })
  }

  const filteredChecklists = checklists.filter(checklist => {
    if (isAdminOrManager) return true
    if (isTeamLead || isStaff) {
      return checklist.teamId === userTeamId
    }
    return false
  })

  const canEditChecklist = (checklist) => {
    if (isAdminOrManager) return true
    if (isTeamLead) {
      return checklist.teamId === userTeamId
    }
    if (isStaff) {
      return checklist.createdById === user?.id
    }
    return false
  }

  const getUserTeamName = () => {
    const team = teams.find(t => t.id === userTeamId)
    return team?.name || ''
  }

  const getUserTeamNameDisplay = () => {
    return getUserTeamName() || 'Your Team'
  }

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Checklists</h1>
        {canCreate && <button onClick={() => { resetForm(); setShowModal(true); setError('') }} className="btn btn-primary">Create Checklist</button>}
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}

      {filteredChecklists.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500">No checklists available for you.</p>
        </div>
      ) : (
      <div className="space-y-4">
        {filteredChecklists.map((checklist) => {
          const assignedUsers = [...new Set(checklist.items?.filter(i => i.assignedToName).map(i => i.assignedToName) || [])]
          return (
          <div key={checklist.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg">{checklist.title}</h3>
                <p className="text-xs text-gray-400">Created by: {checklist.createdByName || 'Unknown'}</p>
                {checklist.description && <p className="text-sm text-gray-500">{checklist.description}</p>}
                <div className="flex flex-wrap gap-2 mt-2">
                  {checklist.shiftName && <span className="badge badge-blue">{checklist.shiftName}</span>}
                  {checklist.teamName && <span className="badge badge-green">{checklist.teamName}</span>}
                </div>
                {checklist.progressPercentage !== undefined && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-xs">
                      <div className="bg-green-500 rounded-full h-2" style={{ width: `${checklist.progressPercentage}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{checklist.progressPercentage}%</span>
                  </div>
                )}
                {assignedUsers.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {assignedUsers.map((name, idx) => (
                      <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-gray-100 text-gray-700">
                        {name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex gap-2 ml-2 shrink-0">
                {canEditChecklist(checklist) && (
                  <button onClick={() => handleEdit(checklist)} className="text-blue-600 hover:text-blue-800 text-sm">Edit</button>
                )}
                {canDelete && <button onClick={() => handleDelete(checklist.id)} className="text-red-600 hover:text-red-800">Delete</button>}
              </div>
            </div>
            <div className="space-y-2">
              {checklist.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 flex-1">
                    <input type="checkbox" checked={item.completed} onChange={() => handleComplete(item.id, item.completed)} className="w-4 h-4 shrink-0" />
                    <div>
                      <p className={`font-medium ${item.completed ? 'line-through text-gray-400' : ''}`}>{item.title}</p>
                      {item.description && <p className="text-xs text-gray-400">{item.description}</p>}
                    </div>
                  </div>
                  {item.assignedToName && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-blue-50 text-blue-700 ml-2 shrink-0">
                      {item.assignedToName}
                    </span>
                  )}
                </div>
              ))}
              {(!checklist.items || checklist.items.length === 0) && (
                <p className="text-gray-400 text-sm text-center py-2">No items in this checklist</p>
              )}
            </div>
          </div>
          )
        })}
      </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create Checklist</h3>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Title" className="input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              <textarea placeholder="Description" className="input" rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <select className="input" value={formData.shiftId} onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}>
                  <option value="">Select Shift</option>
                  {shifts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {isAdminOrManager ? (
                  <select className="input" value={formData.teamId} onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}>
                    <option value="">Select Team</option>
                    {availableTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                ) : (
                  <input type="text" className="input bg-gray-100" value={getUserTeamNameDisplay()} disabled title="Your Team" />
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Checklist Items</h4>
                <div className="space-y-2 mb-3">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{item.title}</span>
                        {item.assignedToId && <span className="badge badge-blue text-xs">{teamUsers.find(u => u.id === Number(item.assignedToId))?.firstName || ''}</span>}
                      </div>
                      <button type="button" onClick={() => removeItem(idx)} className="text-red-600 text-sm">Remove</button>
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

              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</button>
                <button type="button" onClick={() => { setShowModal(false); setError('') }} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Edit Checklist</h3>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
            <form onSubmit={handleUpdate} className="space-y-4">
              <input type="text" placeholder="Title" className="input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              <textarea placeholder="Description" className="input" rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <select className="input" value={formData.shiftId} onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}>
                  <option value="">Select Shift</option>
                  {shifts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                {isAdminOrManager ? (
                  <select className="input" value={formData.teamId} onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}>
                    <option value="">Select Team</option>
                    {availableTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                ) : (
                  <input type="text" className="input bg-gray-100" value={getUserTeamNameDisplay()} disabled title="Your Team" />
                )}
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Checklist Items</h4>
                <div className="space-y-2 mb-3">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{item.title}</span>
                        {item.assignedToId && <span className="badge badge-blue text-xs">{teamUsers.find(u => u.id === Number(item.assignedToId))?.firstName || ''}</span>}
                      </div>
                      <button type="button" onClick={() => removeItem(idx)} className="text-red-600 text-sm">Remove</button>
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

              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>{submitting ? 'Updating...' : 'Update'}</button>
                <button type="button" onClick={() => { setShowEditModal(false); setEditingChecklist(null); setError(''); resetForEdit(); setTeamUsers([]) }} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}