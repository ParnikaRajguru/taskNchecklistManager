import { useState, useEffect } from 'react'
import { teamService, projectService, userService } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Teams() {
  const [teams, setTeams] = useState([])
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTeam, setEditingTeam] = useState(null)
  const { user } = useAuth()
  const [formData, setFormData] = useState({ name: '', description: '', projectId: '', teamManagerId: '', teamLeadId: '', memberIds: [] })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const usersPromise = userService.getAll().catch(() => ({ data: [] }))
      const [teamsRes, projectsRes, usersRes] = await Promise.all([teamService.getAll(), projectService.getAll(), usersPromise])
      setTeams(teamsRes.data)
      setProjects(projectsRes.data)
      setUsers(usersRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = {
        ...formData,
        projectId: formData.projectId || null,
        teamManagerId: formData.teamManagerId || null,
        teamLeadId: formData.teamLeadId || null,
        memberIds: formData.memberIds || []
      }
      if (editingTeam) await teamService.update(editingTeam.id, data)
      else await teamService.create(data)
      setShowModal(false)
      setEditingTeam(null)
      resetForm()
      loadData()
    } catch (err) { alert(err.response?.data?.message || 'Failed to save') }
  }

  const handleEdit = (team) => {
    setEditingTeam(team)
    setFormData({
      name: team.name,
      description: team.description || '',
      projectId: team.projectId || '',
      teamManagerId: team.teamManagerId || '',
      teamLeadId: team.teamLeadId || '',
      memberIds: team.memberIds || []
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this team?')) {
      try { await teamService.delete(id); loadData() }
      catch (err) { alert('Failed to delete') }
    }
  }

  const toggleMember = (userId) => {
    setFormData(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(userId)
        ? prev.memberIds.filter(id => id !== userId)
        : [...prev.memberIds, userId]
    }))
  }

  const resetForm = () => setFormData({ name: '', description: '', projectId: '', teamManagerId: '', teamLeadId: '', memberIds: [] })
  const isManager = ['SUPER_ADMIN', 'PROJECT_MANAGER', 'MANAGER'].includes(user?.role)
  const isStaff = ['STAFF'].includes(user?.role)

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Teams</h1>
        {isManager && <button onClick={() => { resetForm(); setEditingTeam(null); setShowModal(true) }} className="btn btn-primary">Add Team</button>}
      </div>

      {teams.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500">No teams assigned to you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div key={team.id} className="card">
              <h3 className="font-semibold text-lg mb-2">{team.name}</h3>
              <p className="text-gray-500 text-sm mb-3">{team.description || 'No description'}</p>
              <div className="text-sm text-gray-500 mb-3">
                <p>Project: {team.projectName || 'None'}</p>
                <p>Manager: {team.teamManagerName || 'Not assigned'}</p>
                <p>Team Lead: {team.teamLeadName || 'Not assigned'}</p>
              <p>Members: {team.memberCount || 0}</p>
            </div>
            <div className="flex gap-2 text-xs mb-3">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Tasks: {team.taskCount || 0}</span>
              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Shifts: {team.shiftCount || 0}</span>
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">Checklists: {team.checklistCount || 0}</span>
            </div>
              {!isStaff && team.memberNames && team.memberNames.length > 0 && (
                <div className="text-sm text-gray-500 mb-3">
                  <p className="font-medium mb-1">Members:</p>
                  {team.memberIds.map((mid, idx) => {
                    const member = users.find(u => u.id === mid)
                    return member ? (
                      <p key={mid} className="ml-2">{member.firstName} {member.lastName} <span className="text-xs text-gray-400">({member.role})</span></p>
                    ) : (
                      <p key={mid} className="ml-2">{team.memberNames?.[idx] || 'Unknown'}</p>
                    )
                  })}
                </div>
              )}
              {isStaff && (
                <div className="text-sm text-gray-500 mb-3">
                  <p className="font-medium mb-1">Members:</p>
                  {team.memberNames?.map((name, idx) => (
                    <p key={idx} className="ml-2">{name}</p>
                  ))}
                </div>
              )}
              {isManager && <div className="flex gap-2"><button onClick={() => handleEdit(team)} className="btn btn-secondary text-sm">Edit</button><button onClick={() => handleDelete(team.id)} className="btn btn-danger text-sm">Delete</button></div>}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">{editingTeam ? 'Edit' : 'Create'} Team</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Team Name" className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              <textarea placeholder="Description" className="input" rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              <select className="input" value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}>
                <option value="">Select Project</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select className="input" value={formData.teamManagerId} onChange={(e) => setFormData({ ...formData, teamManagerId: e.target.value })}>
                <option value="">Select Manager</option>
                {users.filter(u => ['MANAGER', 'PROJECT_MANAGER', 'SUPER_ADMIN'].includes(u.role)).map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
              </select>
              <select className="input" value={formData.teamLeadId} onChange={(e) => setFormData({ ...formData, teamLeadId: e.target.value })}>
                <option value="">Select Team Lead</option>
                {users.filter(u => ['TEAM_LEAD', 'MANAGER', 'PROJECT_MANAGER'].includes(u.role)).map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
              </select>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Team Members</label>
                <div className="max-h-40 overflow-y-auto border rounded-lg p-2 space-y-1">
                  {users.filter(u => !['SUPER_ADMIN'].includes(u.role)).map((u) => (
                    <label key={u.id} className="flex items-center gap-2 p-1 hover:bg-gray-50 rounded cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.memberIds.includes(u.id)}
                        onChange={() => toggleMember(u.id)}
                        className="rounded"
                      />
                      <span className="text-sm">{u.firstName} {u.lastName} ({u.role})</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary flex-1">{editingTeam ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => setShowModal(false)} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
