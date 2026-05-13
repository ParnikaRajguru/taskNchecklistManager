import { useState, useEffect } from 'react'
import { checklistService, shiftService, teamService, taskService, userService, projectService } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Checklists() {
  const [checklists, setChecklists] = useState([])
  const [shifts, setShifts] = useState([])
  const [teams, setTeams] = useState([])
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const { user } = useAuth()
  const [formData, setFormData] = useState({ title: '', description: '', projectId: '', shiftId: '', teamId: '', items: [] })
  const [newItem, setNewItem] = useState({ title: '', description: '', assignedToId: '', taskId: '' })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const usersPromise = userService.getAll().catch(() => ({ data: [] }))
      const [checklistsRes, shiftsRes, teamsRes, tasksRes, usersRes, projectsRes] = await Promise.all([
        checklistService.getAll(), shiftService.getAll(), teamService.getAll(), taskService.getAll(), usersPromise, projectService.getAll()
      ])
      setChecklists(checklistsRes.data)
      setShifts(shiftsRes.data)
      setTeams(teamsRes.data)
      setTasks(tasksRes.data)
      setUsers(usersRes.data)
      setProjects(projectsRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = { ...formData, shiftId: formData.shiftId || null, teamId: formData.teamId || null, taskId: formData.taskId || null }
      await checklistService.create(data)
      setShowModal(false)
      resetForm()
      loadData()
    } catch (err) { alert(err.response?.data?.message || 'Failed to save') }
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
      catch (err) { alert('Failed to delete') }
    }
  }

  const addItem = () => {
    if (!newItem.title) return
    setFormData({ ...formData, items: [...formData.items, { ...newItem, assignedToId: newItem.assignedToId || null, taskId: newItem.taskId || null }] })
    setNewItem({ title: '', description: '', assignedToId: '', taskId: '' })
  }

  const removeItem = (index) => {
    setFormData({ ...formData, items: formData.items.filter((_, i) => i !== index) })
  }

  const resetForm = () => setFormData({ title: '', description: '', shiftId: '', teamId: '', taskId: '', items: [] })
  const isManager = ['SUPER_ADMIN', 'PROJECT_MANAGER', 'MANAGER', 'TEAM_LEAD'].includes(user?.role)

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Checklists</h1>
        {isManager && <button onClick={() => { resetForm(); setShowModal(true) }} className="btn btn-primary">Create Checklist</button>}
      </div>

      {checklists.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500">No checklists available for you.</p>
        </div>
      ) : (
      <div className="space-y-4">
        {checklists.map((checklist) => (
          <div key={checklist.id} className="card">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold text-lg">{checklist.title}</h3>
                <p className="text-sm text-gray-500">{checklist.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Project: {checklist.projectName || 'None'} | Shift: {checklist.shiftName || 'None'} | Team: {checklist.teamName || 'None'} | Task: {checklist.taskTitle || 'None'}
                </p>
                {checklist.progressPercentage !== undefined && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 rounded-full h-2" style={{ width: `${checklist.progressPercentage}%` }} />
                    </div>
                    <span className="text-xs text-gray-500">{checklist.progressPercentage}%</span>
                  </div>
                )}
              </div>
              {isManager && <button onClick={() => handleDelete(checklist.id)} className="text-red-600 hover:text-red-800">Delete</button>}
            </div>
            <div className="space-y-2">
              {checklist.items?.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" checked={item.completed} onChange={() => handleComplete(item.id, item.completed)} className="w-4 h-4" />
                    <div>
                      <p className={`font-medium ${item.completed ? 'line-through text-gray-400' : ''}`}>{item.title}</p>
                      {item.taskTitle && <p className="text-xs text-gray-500">Task: {item.taskTitle}</p>}
                    </div>
                  </div>
                  {item.assignedToName && <span className="text-sm text-gray-500">{item.assignedToName}</span>}
                </div>
              ))}
              {(!checklist.items || checklist.items.length === 0) && (
                <p className="text-gray-400 text-sm text-center py-2">No items in this checklist</p>
              )}
            </div>
          </div>
        ))}
      </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create Checklist</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Title" className="input" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              <textarea placeholder="Description" className="input" rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              <div className="grid grid-cols-2 gap-4">
                <select className="input" value={formData.shiftId} onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}>
                  <option value="">Select Shift</option>
                  {shifts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
                <select className="input" value={formData.teamId} onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}>
                  <option value="">Select Team</option>
                  {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              <select className="input" value={formData.taskId} onChange={(e) => setFormData({ ...formData, taskId: e.target.value })}>
                <option value="">Link to Task (optional)</option>
                {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
              </select>

              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Checklist Items</h4>
                <div className="space-y-2 mb-3">
                  {formData.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>{item.title}</span>
                      <button type="button" onClick={() => removeItem(idx)} className="text-red-600">Remove</button>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <input type="text" placeholder="Item title" className="input" value={newItem.title} onChange={(e) => setNewItem({ ...newItem, title: e.target.value })} />
                  <select className="input" value={newItem.assignedToId} onChange={(e) => setNewItem({ ...newItem, assignedToId: e.target.value })}>
                    <option value="">Assign to</option>
                    {users.map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
                  </select>
                </div>
                <select className="input mb-2" value={newItem.taskId} onChange={(e) => setNewItem({ ...newItem, taskId: e.target.value })}>
                  <option value="">Link to Task (optional)</option>
                  {tasks.map((t) => <option key={t.id} value={t.id}>{t.title}</option>)}
                </select>
                <button type="button" onClick={addItem} className="btn btn-secondary w-full">Add Item</button>
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary flex-1">Create</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
