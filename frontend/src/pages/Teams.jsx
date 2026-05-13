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
  const [formData, setFormData] = useState({ name: '', description: '', projectId: '', teamLeadId: '' })

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const [teamsRes, projectsRes, usersRes] = await Promise.all([teamService.getAll(), projectService.getAll(), userService.getAll()])
      setTeams(teamsRes.data)
      setProjects(projectsRes.data)
      setUsers(usersRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const data = { ...formData, projectId: formData.projectId || null, teamLeadId: formData.teamLeadId || null }
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
    setFormData({ name: team.name, description: team.description || '', projectId: team.projectId || '', teamLeadId: team.teamLeadId || '' })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this team?')) {
      try { await teamService.delete(id); loadData() }
      catch (err) { alert('Failed to delete') }
    }
  }

  const resetForm = () => setFormData({ name: '', description: '', projectId: '', teamLeadId: '' })
  const isManager = ['SUPER_ADMIN', 'PROJECT_MANAGER', 'MANAGER'].includes(user?.role)

  if (loading) return <div className="text-center py-8">Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Teams</h1>
        {isManager && <button onClick={() => { resetForm(); setEditingTeam(null); setShowModal(true) }} className="btn btn-primary">Add Team</button>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams.map((team) => (
          <div key={team.id} className="card">
            <h3 className="font-semibold text-lg mb-2">{team.name}</h3>
            <p className="text-gray-500 text-sm mb-3">{team.description || 'No description'}</p>
            <div className="text-sm text-gray-500 mb-3">
              <p>Project: {team.projectName || 'None'}</p>
              <p>Team Lead: {team.teamLeadName || 'Not assigned'}</p>
              <p>Members: {team.memberCount || 0}</p>
            </div>
            {isManager && <div className="flex gap-2"><button onClick={() => handleEdit(team)} className="btn btn-secondary text-sm">Edit</button><button onClick={() => handleDelete(team.id)} className="btn btn-danger text-sm">Delete</button></div>}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">{editingTeam ? 'Edit' : 'Create'} Team</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" placeholder="Team Name" className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              <textarea placeholder="Description" className="input" rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              <select className="input" value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}>
                <option value="">Select Project</option>
                {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <select className="input" value={formData.teamLeadId} onChange={(e) => setFormData({ ...formData, teamLeadId: e.target.value })}>
                <option value="">Select Team Lead</option>
                {users.filter(u => ['TEAM_LEAD', 'MANAGER', 'PROJECT_MANAGER'].includes(u.role)).map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName}</option>)}
              </select>
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