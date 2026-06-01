import { useState, useEffect } from 'react'
import { teamService, projectService, userService } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Teams() {
  const [teams, setTeams] = useState([])
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingTeam, setEditingTeam] = useState(null)
  const [error, setError] = useState('')
  const { user } = useAuth()
  const [formData, setFormData] = useState({ name: '', description: '', projectId: '', managerId: '', teamLeadId: '', memberIds: [] })

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
      const data = {
        name: formData.name,
        description: formData.description || null,
        projectId: formData.projectId ? Number(formData.projectId) : null,
        managerId: formData.managerId ? Number(formData.managerId) : null,
        teamLeadId: formData.teamLeadId ? Number(formData.teamLeadId) : null,
        memberIds: (formData.memberIds || []).filter(id => id && id > 0)
      }
      if (editingTeam) await teamService.update(editingTeam.id, data)
      else await teamService.create(data)
      setShowModal(false)
      setEditingTeam(null)
      resetForm()
      loadData()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (team) => {
    setEditingTeam(team)
    setFormData({
      name: team.name,
      description: team.description || '',
      projectId: team.projectId || '',
      managerId: team.managerId || '',
      teamLeadId: team.teamLeadId || '',
      memberIds: team.memberIds || []
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (confirm('Delete this team? This will unassign all members and tasks.')) {
      try {
        await teamService.delete(id)
        alert('Team deleted successfully')
        loadData()
      }
      catch (err) {
        const msg = err.response?.data?.message || err.response?.data || 'Failed to delete team'
        alert(typeof msg === 'object' ? JSON.stringify(msg) : msg)
      }
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

  const resetForm = () => setFormData({ name: '', description: '', projectId: '', managerId: '', teamLeadId: '', memberIds: [] })

  const managers = users.filter(u => u.role === 'MANAGER')
  const teamLeads = users.filter(u => u.role === 'TEAM_LEAD')
  const memberPool = users.filter(u => ['STAFF', 'DEVELOPER', 'TESTER'].includes(u.role))

  const assignedProjectIds = teams.map(t => t.projectId).filter(id => id != null)
  const availableProjects = projects.filter(p => !assignedProjectIds.includes(p.id) || p.id === editingTeam?.projectId)

  const managerTeamCounts = {}
  teams.forEach(t => {
    if (t.managerId) { managerTeamCounts[t.managerId] = (managerTeamCounts[t.managerId] || 0) + 1 }
  })

  const teamLeadIdsInOtherTeams = new Set(
    teams.filter(t => t.id !== editingTeam?.id && t.teamLeadId).map(t => t.teamLeadId)
  )
  const memberIdsInOtherTeams = new Set(
    teams.filter(t => t.id !== editingTeam?.id).flatMap(t => t.memberIds || [])
  )

  const availableManagers = managers.filter(u => {
    if (u.id === Number(formData.managerId)) return true
    if (editingTeam && u.id === editingTeam.managerId) return true
    const currentCount = managerTeamCounts[u.id] || 0
    return currentCount < 3
  })
  const availableTeamLeads = teamLeads.filter(u => {
    if (u.id === Number(formData.teamLeadId)) return true
    if (editingTeam && u.id === editingTeam.teamLeadId) return true
    return !teamLeadIdsInOtherTeams.has(u.id)
  })
  const availableMembers = memberPool.filter(u => {
    if (formData.memberIds.includes(u.id)) return true
    if (u.id === Number(formData.managerId) || u.id === Number(formData.teamLeadId)) return false
    if (memberIdsInOtherTeams.has(u.id)) return false
    if (editingTeam && editingTeam.memberIds && editingTeam.memberIds.includes(u.id)) return true
    return true
  })

  const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(user?.role)

  if (loading) return <div className="text-center py-8"><div className="skeleton h-8 w-48 mx-auto mb-4" /><div className="grid grid-cols-3 gap-4"><div className="skeleton h-48 rounded-xl" /><div className="skeleton h-48 rounded-xl" /><div className="skeleton h-48 rounded-xl" /></div></div>

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Teams</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your teams and members</p>
        </div>
        {isManager && (
          <button onClick={() => { resetForm(); setEditingTeam(null); setShowModal(true) }} className="btn btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Add Team
          </button>
        )}
      </div>

      {teams.length === 0 ? (
        <div className="empty-state card py-12">
          <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
          <p className="empty-state-text">No teams assigned to you.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((team) => (
            <div key={team.id} className="card p-5 hover:shadow-soft-md transition-all duration-200">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-semibold text-slate-900 truncate">{team.name}</h3>
                <span className="text-xs font-mono text-slate-400 shrink-0">{team.publicId}</span>
              </div>
              <p className="text-sm text-slate-500 mb-4 line-clamp-2">{team.description || 'No description'}</p>
              <div className="text-sm text-slate-600 space-y-1 mb-4">
                <div className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>Project: {team.projectName || 'None'}</div>
                <div className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>Manager: {team.managerName || 'Not assigned'}</div>
                <div className="flex items-center gap-1.5"><svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0z" /></svg>Team Lead: {team.teamLeadName || 'Not assigned'}</div>
              </div>
              <div className="flex items-center gap-2 text-xs mb-4">
                <span className="inline-flex items-center gap-1 bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>
                  {team.memberCount || 0} members
                </span>
                <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full font-medium">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08" /></svg>
                  {team.taskCount || 0} tasks
                </span>
              </div>
              {team.memberNames && team.memberNames.length > 0 && (
                <div className="text-sm text-slate-600 mb-4">
                  <p className="font-medium text-xs text-slate-500 uppercase tracking-wider mb-1.5">Members:</p>
                  <div className="space-y-0.5">
                    {team.memberIds.map((mid, idx) => {
                      const member = users.find(u => u.id === mid)
                      return (
                        <div key={mid} className="flex items-center gap-1.5 text-xs">
                          <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
                          {member ? `${member.firstName} ${member.lastName}` : (team.memberNames?.[idx] || 'Unknown')}
                          {member && <span className="text-slate-400">({member.role})</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              {isManager && (
                <div className="flex gap-2 pt-3 border-t border-slate-100">
                  <button onClick={() => handleEdit(team)} className="btn btn-ghost text-xs px-3 py-1.5">Edit</button>
                  <button onClick={() => handleDelete(team.id)} className="btn btn-ghost text-xs px-3 py-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-50">Delete</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); setError('') }}}>
          <div className="modal-content max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">{editingTeam ? 'Edit' : 'Create'} Team</h3>
              <button onClick={() => { setShowModal(false); setError('') }} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {error && <div className="mx-6 mt-4 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700"><svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Team Name</label>
                  <input type="text" placeholder="Enter team name" className="input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
                  <textarea placeholder="Enter description" className="input" rows="2" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Project</label>
                  <select className="input" value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}>
                    <option value="">Select Project</option>
                    {availableProjects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Team Manager</label>
                  <select className="input" value={formData.managerId} onChange={(e) => {
                    const val = e.target.value
                    setFormData(prev => ({ ...prev, managerId: val, memberIds: prev.memberIds.filter(id => id !== Number(val)) }))
                  }}>
                    <option value="">Select Manager</option>
                    {availableManagers.map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Team Lead</label>
                  <select className="input" value={formData.teamLeadId} onChange={(e) => {
                    const val = e.target.value
                    setFormData(prev => ({ ...prev, teamLeadId: val, memberIds: prev.memberIds.filter(id => id !== Number(val)) }))
                  }}>
                    <option value="">Select Team Lead</option>
                    {availableTeamLeads.map((u) => <option key={u.id} value={u.id}>{u.firstName} {u.lastName} ({u.role})</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Team Members <span className="text-xs text-slate-400 font-normal">(Staff, Developer, Tester)</span>
                  </label>
                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-0.5">
                    {availableMembers.map((u) => (
                      <label key={u.id} className="flex items-center gap-2.5 p-1.5 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.memberIds.includes(u.id)}
                          onChange={() => toggleMember(u.id)}
                          className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-slate-700">{u.firstName} {u.lastName} <span className="text-slate-400">({u.role})</span></span>
                      </label>
                    ))}
                    {availableMembers.length === 0 && (
                      <p className="text-xs text-slate-400 text-center py-3">No members available</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => { setShowModal(false); setError('') }} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <span className="flex items-center gap-2"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Saving...</span>
                  ) : (editingTeam ? 'Update Team' : 'Create Team')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
