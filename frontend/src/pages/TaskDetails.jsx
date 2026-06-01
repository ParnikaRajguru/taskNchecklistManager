import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { taskService, checklistService, noteService, userService, shiftService } from '../services/api'
import { useAuth } from '../context/AuthContext'

function getStatusColor(status) {
  const colors = { TODO: 'blue', IN_PROGRESS: 'yellow', IN_REVIEW: 'purple', TESTING: 'orange', COMPLETED: 'green', BLOCKED: 'red' }
  return colors[status] || 'gray'
}
function getStatusLabel(status) {
  const labels = { TODO: 'Todo', IN_PROGRESS: 'In Progress', IN_REVIEW: 'In Review', TESTING: 'Testing', COMPLETED: 'Completed', BLOCKED: 'Blocked' }
  return labels[status] || status
}

export default function TaskDetails() {
  const { projectId, teamId, taskId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [task, setTask] = useState(null)
  const [checklists, setChecklists] = useState([])
  const [notes, setNotes] = useState([])
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [newNote, setNewNote] = useState('')
  const [addingNote, setAddingNote] = useState(false)
  const [error, setError] = useState('')

  const [showChecklistModal, setShowChecklistModal] = useState(false)
  const [checklistForm, setChecklistForm] = useState({ title: '', description: '', shiftId: '', items: [] })
  const [newItem, setNewItem] = useState({ title: '', description: '', assignedToId: '' })
  const [teamUsers, setTeamUsers] = useState([])

  const canCreateChecklist = ['SUPER_ADMIN', 'MANAGER', 'TEAM_LEAD', 'STAFF', 'DEVELOPER', 'TESTER'].includes(user?.role)

  const resolvedTeamId = teamId ? Number(teamId) : null

  useEffect(() => { loadData() }, [taskId])

  useEffect(() => {
    if (showChecklistModal) { loadTeamUsers(); setError('') }
  }, [showChecklistModal])

  const loadData = async () => {
    try {
      const [taskRes, checklistRes, notesRes, shiftsRes] = await Promise.all([
        taskService.getById(taskId),
        checklistService.getByTask(taskId),
        noteService.getByTask(taskId),
        shiftService.getAll().catch(() => ({ data: [] }))
      ])
      setTask(taskRes.data)
      setChecklists(checklistRes.data)
      setNotes(notesRes.data)
      setShifts(shiftsRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const loadTeamUsers = async () => {
    const targetTeamId = resolvedTeamId || task?.teamId || user?.teamId
    if (targetTeamId) {
      try {
        const res = await userService.getByTeam(targetTeamId)
        setTeamUsers(res.data.filter(u => u.id !== user?.id && u.role !== 'SUPER_ADMIN'))
      } catch { setTeamUsers([]) }
    }
  }

  const handleAddNote = async (e) => {
    e.preventDefault()
    if (!newNote.trim()) return
    setAddingNote(true)
    try {
      await noteService.addNote(taskId, newNote)
      setNewNote('')
      const res = await noteService.getByTask(taskId)
      setNotes(res.data)
    } catch (err) { alert('Failed to add note') }
    finally { setAddingNote(false) }
  }

  const handleDeleteNote = async (noteId) => {
    if (!confirm('Delete this note?')) return
    try {
      await noteService.deleteNote(noteId)
      const res = await noteService.getByTask(taskId)
      setNotes(res.data)
    } catch (err) { alert('Failed to delete note') }
  }

  const handleCompleteChecklistItem = async (itemId, completed) => {
    try {
      if (completed) await checklistService.uncompleteItem(itemId)
      else await checklistService.completeItem(itemId)
      const res = await checklistService.getByTask(taskId)
      setChecklists(res.data)
    } catch (err) { alert('Failed to update item') }
  }

  const addChecklistItem = () => {
    if (!newItem.title) return
    if (newItem.assignedToId && Number(newItem.assignedToId) === user?.id) {
      setError('You cannot assign an item to yourself'); return
    }
    setChecklistForm({ ...checklistForm, items: [...checklistForm.items, { ...newItem, assignedToId: newItem.assignedToId || null }] })
    setNewItem({ title: '', description: '', assignedToId: '' })
  }

  const removeChecklistItem = (index) => {
    setChecklistForm({ ...checklistForm, items: checklistForm.items.filter((_, i) => i !== index) })
  }

  const handleCreateChecklist = async (e) => {
    e.preventDefault()
    setError('')
    try {
      const effectiveTeamId = resolvedTeamId || task?.teamId || null
      const data = {
        ...checklistForm,
        taskId: Number(taskId),
        teamId: effectiveTeamId,
        shiftId: checklistForm.shiftId || null
      }
      await checklistService.create(data)
      setShowChecklistModal(false)
      setChecklistForm({ title: '', description: '', shiftId: '', items: [] })
      setError('')
      const res = await checklistService.getByTask(taskId)
      setChecklists(res.data)
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to create checklist')
    }
  }

  const getFilteredUsers = () => {
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

  if (loading) return <div className="text-center py-8"><div className="skeleton h-8 w-64 mx-auto mb-4" /><div className="skeleton h-48 w-full rounded-xl mb-4" /><div className="grid grid-cols-2 gap-6"><div className="skeleton h-64 rounded-xl" /><div className="skeleton h-64 rounded-xl" /></div></div>
  if (!task) return <div className="empty-state card py-12"><p className="empty-state-text">Task not found</p></div>

  const totalItems = checklists.reduce((sum, c) => sum + (c.items?.length || 0), 0)
  const completedItems = checklists.reduce((sum, c) => sum + (c.items?.filter(i => i.completed)?.length || 0), 0)
  const overallProgress = totalItems > 0 ? Math.round(completedItems * 100 / totalItems) : (task.checklistProgress || 0)

  const backPath = projectId && teamId ? `/projects/${projectId}/teams/${teamId}` : '/tasks'

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate(backPath)} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
        Back
      </button>

      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-slate-900">{task.title}</h1>
            <p className="text-sm text-slate-500 mt-1">
              {task.projectName && <span>Project: {task.projectName}</span>}
              {task.teamName && <span> | Team: {task.teamName}</span>}
            </p>
          </div>
          <button onClick={() => setShowChecklistModal(true)} className="btn btn-primary shrink-0">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Add Checklist
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className={`badge badge-${getStatusColor(task.status)}`}>{getStatusLabel(task.status)}</span>
          <span className={`badge badge-${task.priority === 'HIGH' ? 'red' : task.priority === 'MEDIUM' ? 'blue' : 'gray'}`}>{task.priority}</span>
        </div>

        {task.description && <p className="text-sm text-slate-600 mb-4">{task.description}</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Assigned To</p>
            <p className="font-medium text-slate-900 mt-1">{task.assignedToName || 'Unassigned'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Due Date</p>
            <p className="font-medium text-slate-900 mt-1">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Created By</p>
            <p className="font-medium text-slate-900 mt-1">{task.createdByName || 'Unknown'}</p>
          </div>
        </div>

        {totalItems > 0 && (
          <div>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-slate-200 rounded-full h-2.5 overflow-hidden">
                <div className="bg-emerald-500 rounded-full h-2.5 transition-all duration-500" style={{ width: `${overallProgress}%` }} />
              </div>
              <span className="text-sm text-slate-500 shrink-0">{overallProgress}% complete ({completedItems}/{totalItems})</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card overflow-hidden">
          <div className="section-header px-5 py-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h2 className="section-title">Checklists ({checklists.length})</h2>
            </div>
          </div>
          <div className="p-5 space-y-4">
            {checklists.length > 0 ? checklists.map(cl => (
              <div key={cl.id} className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900">{cl.title}</h3>
                    {cl.description && <p className="text-xs text-slate-500 mt-0.5">{cl.description}</p>}
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {cl.shiftName && <span className="badge badge-blue text-[11px]">{cl.shiftName}</span>}
                      {cl.teamName && <span className="badge badge-green text-[11px]">{cl.teamName}</span>}
                    </div>
                  </div>
                  {cl.progressPercentage !== undefined && (
                    <span className="text-xs text-slate-500 shrink-0">{cl.progressPercentage}%</span>
                  )}
                </div>
                <div className="space-y-1.5">
                  {cl.items?.map(item => (
                    <div key={item.id} className={`checklist-item ${item.completed ? 'completed' : ''}`}>
                      <input type="checkbox" checked={item.completed} onChange={() => handleCompleteChecklistItem(item.id, item.completed)}
                        className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500 shrink-0" />
                      <span className={`flex-1 text-sm ${item.completed ? 'line-through text-slate-400' : 'text-slate-700'}`}>{item.title}</span>
                      {item.assignedToName && <span className="text-xs text-slate-500 shrink-0">{item.assignedToName}</span>}
                    </div>
                  ))}
                  {(!cl.items || cl.items.length === 0) && <p className="text-xs text-slate-400 text-center py-2">No items</p>}
                </div>
              </div>
            )) : (
              <div className="empty-state py-8">
                <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="empty-state-text">No checklists for this task.</p>
              </div>
            )}
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-5 py-4 bg-gradient-to-r from-emerald-50 to-slate-50 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                <h2 className="text-base font-semibold text-emerald-800">Notes ({notes.length})</h2>
              </div>
            </div>
          </div>
          <div className="p-5">
            <form onSubmit={handleAddNote} className="mb-4">
              <div className="flex gap-2">
                <input type="text" placeholder="Add a note..." className="input flex-1" value={newNote} onChange={(e) => setNewNote(e.target.value)} />
                <button type="submit" className="btn btn-primary" disabled={addingNote || !newNote.trim()}>
                  {addingNote ? (
                    <span className="flex items-center gap-1"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Adding...</span>
                  ) : 'Add'}
                </button>
              </div>
            </form>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notes.length > 0 ? notes.map(note => (
                <div key={note.id} className="bg-slate-50 rounded-xl p-4 hover:bg-slate-100/50 transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm text-slate-900">{note.createdByName}</p>
                      <p className="text-xs text-slate-500">{note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}</p>
                    </div>
                    {user?.role === 'SUPER_ADMIN' && (
                      <button onClick={() => handleDeleteNote(note.id)} className="btn btn-ghost text-xs px-2 py-1 text-rose-600 hover:bg-rose-50 shrink-0">Delete</button>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{note.content}</p>
                </div>
              )) : (
                <div className="empty-state py-6">
                  <svg className="empty-state-icon w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                  <p className="empty-state-text">No notes yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showChecklistModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowChecklistModal(false); setError('') }}}>
          <div className="modal-content max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Create Checklist for Task</h3>
              <button onClick={() => { setShowChecklistModal(false); setError('') }} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {error && <div className="mx-6 mt-4 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700"><svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>{error}</div>}
            <form onSubmit={handleCreateChecklist}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Title</label>
                  <input type="text" placeholder="Checklist title" className="input" value={checklistForm.title} onChange={(e) => setChecklistForm({ ...checklistForm, title: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <textarea placeholder="Description" className="input" rows="2" value={checklistForm.description} onChange={(e) => setChecklistForm({ ...checklistForm, description: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Shift</label>
                    <select className="input" value={checklistForm.shiftId} onChange={(e) => setChecklistForm({ ...checklistForm, shiftId: e.target.value })}>
                      <option value="">Select Shift</option>
                      {shifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Team</label>
                    <input type="text" className="input bg-slate-50 text-slate-600" value={task?.teamName || 'Current Team'} disabled />
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4">
                  <h4 className="font-medium text-slate-900 mb-3">Checklist Items</h4>
                  <div className="space-y-2 mb-3">
                    {checklistForm.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <span className="text-sm text-slate-700 truncate">{item.title}</span>
                        </div>
                        <button type="button" onClick={() => removeChecklistItem(idx)} className="text-rose-500 hover:text-rose-700 text-sm font-medium shrink-0 ml-2">Remove</button>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <input type="text" placeholder="Item title" className="input" value={newItem.title}
                      onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
                    <select className="input" value={newItem.assignedToId} onChange={(e) => setNewItem({ ...newItem, assignedToId: e.target.value })}>
                      <option value="">Assign to</option>
                      {getFilteredUsers().map(u => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role})</option>)}
                    </select>
                  </div>
                  <button type="button" onClick={addChecklistItem} className="btn btn-secondary w-full">Add Item</button>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => { setShowChecklistModal(false); setError('') }} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary">Create Checklist</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
