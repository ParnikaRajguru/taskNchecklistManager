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

  const isAdminOrManager = ['SUPER_ADMIN', 'MANAGER'].includes(user?.role)
  const isTeamLead = user?.role === 'TEAM_LEAD'
  const canCreateChecklist = ['SUPER_ADMIN', 'MANAGER', 'TEAM_LEAD', 'STAFF', 'DEVELOPER', 'TESTER'].includes(user?.role)

  const resolvedTeamId = teamId ? Number(teamId) : null

  useEffect(() => { loadData() }, [taskId])

  useEffect(() => {
    if (showChecklistModal) {
      loadTeamUsers()
      setError('')
    }
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

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (!task) return <div className="text-center py-8">Task not found</div>

  const totalItems = checklists.reduce((sum, c) => sum + (c.items?.length || 0), 0)
  const completedItems = checklists.reduce((sum, c) => sum + (c.items?.filter(i => i.completed)?.length || 0), 0)
  const overallProgress = totalItems > 0 ? Math.round(completedItems * 100 / totalItems) : (task.checklistProgress || 0)

  const backPath = projectId && teamId ? `/projects/${projectId}/teams/${teamId}` : '/tasks'

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(backPath)} className="text-blue-600 hover:text-blue-800 text-sm">&larr; Back</button>

      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{task.title}</h1>
            <p className="text-sm text-gray-500">
              {task.projectName && <span>Project: {task.projectName}</span>}
              {task.teamName && <span> | Team: {task.teamName}</span>}
            </p>
          </div>
          <button onClick={() => setShowChecklistModal(true)} className="btn btn-primary text-sm">+ Add Checklist</button>
        </div>

        <div className="flex gap-2 mb-3">
          <span className={`badge badge-${getStatusColor(task.status)}`}>{getStatusLabel(task.status)}</span>
          <span className={`badge badge-${task.priority === 'HIGH' ? 'red' : task.priority === 'MEDIUM' ? 'blue' : 'gray'}`}>{task.priority}</span>
        </div>

        {task.description && <p className="text-gray-600 mb-2">{task.description}</p>}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-gray-500">Assigned To</p>
            <p className="font-medium">{task.assignedToName || 'Unassigned'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-gray-500">Due Date</p>
            <p className="font-medium">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Not set'}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded">
            <p className="text-gray-500">Created By</p>
            <p className="font-medium">{task.createdByName || 'Unknown'}</p>
          </div>
        </div>

        {totalItems > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-gray-200 rounded-full h-2.5">
                <div className="bg-green-500 rounded-full h-2.5" style={{ width: `${overallProgress}%` }} />
              </div>
              <span className="text-sm text-gray-500">{overallProgress}% complete ({completedItems}/{totalItems})</span>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="bg-blue-50 px-4 py-3 border-b flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-blue-800">Checklists ({checklists.length})</h2>
            </div>
          </div>
          <div className="p-4 space-y-4">
            {checklists.length > 0 ? checklists.map(cl => (
              <div key={cl.id} className="border rounded-lg p-3">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{cl.title}</h3>
                    {cl.description && <p className="text-xs text-gray-500">{cl.description}</p>}
                    <div className="flex gap-1 mt-1">
                      {cl.shiftName && <span className="badge badge-blue text-xs">{cl.shiftName}</span>}
                      {cl.teamName && <span className="badge badge-green text-xs">{cl.teamName}</span>}
                    </div>
                  </div>
                  {cl.progressPercentage !== undefined && (
                    <span className="text-xs text-gray-500">{cl.progressPercentage}%</span>
                  )}
                </div>
                <div className="space-y-1 mt-2">
                  {cl.items?.map(item => (
                    <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                      <input type="checkbox" checked={item.completed} onChange={() => handleCompleteChecklistItem(item.id, item.completed)} className="w-4 h-4 shrink-0" />
                      <span className={`flex-1 ${item.completed ? 'line-through text-gray-400' : ''}`}>{item.title}</span>
                      {item.assignedToName && <span className="text-xs text-gray-500 shrink-0">{item.assignedToName}</span>}
                    </div>
                  ))}
                  {(!cl.items || cl.items.length === 0) && <p className="text-xs text-gray-400 text-center py-1">No items</p>}
                </div>
              </div>
            )) : (
              <div className="text-center py-8 text-gray-500">
                No checklists for this task.
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="bg-green-50 px-4 py-3 border-b">
            <h2 className="text-lg font-semibold text-green-800">Notes ({notes.length})</h2>
          </div>
          <div className="p-4">
            <form onSubmit={handleAddNote} className="mb-4">
              <div className="flex gap-2">
                <input type="text" placeholder="Add a note..." className="input flex-1" value={newNote} onChange={(e) => setNewNote(e.target.value)} />
                <button type="submit" className="btn btn-primary" disabled={addingNote || !newNote.trim()}>{addingNote ? 'Adding...' : 'Add'}</button>
              </div>
            </form>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notes.length > 0 ? notes.map(note => (
                <div key={note.id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-sm">{note.createdByName}</p>
                      <p className="text-xs text-gray-500">{note.createdAt ? new Date(note.createdAt).toLocaleString() : ''}</p>
                    </div>
                    {user?.role === 'SUPER_ADMIN' && (
                      <button onClick={() => handleDeleteNote(note.id)} className="text-red-600 hover:text-red-800 text-sm">Delete</button>
                    )}
                  </div>
                  <p className="mt-2 text-gray-700 text-sm">{note.content}</p>
                </div>
              )) : (
                <div className="text-center py-4 text-gray-500">No notes yet</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showChecklistModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create Checklist for Task</h3>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
            <form onSubmit={handleCreateChecklist} className="space-y-4">
              <input type="text" placeholder="Title" className="input" value={checklistForm.title} onChange={(e) => setChecklistForm({ ...checklistForm, title: e.target.value })} required />
              <textarea placeholder="Description" className="input" rows="2" value={checklistForm.description} onChange={(e) => setChecklistForm({ ...checklistForm, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <select className="input" value={checklistForm.shiftId} onChange={(e) => setChecklistForm({ ...checklistForm, shiftId: e.target.value })}>
                  <option value="">Select Shift</option>
                  {shifts.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <input type="text" className="input bg-gray-100" value={task?.teamName || 'Current Team'} disabled />
              </div>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Checklist Items</h4>
                <div className="space-y-2 mb-3">
                  {checklistForm.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span className="text-sm">{item.title}</span>
                      <button type="button" onClick={() => removeChecklistItem(idx)} className="text-red-600 text-sm">Remove</button>
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

              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary flex-1">Create</button>
                <button type="button" onClick={() => { setShowChecklistModal(false); setError('') }} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
