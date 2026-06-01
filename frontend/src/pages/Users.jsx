import { useState, useEffect } from 'react'
import { userService, teamService, shiftService, authService } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Users() {
  const [users, setUsers] = useState([])
  const [teams, setTeams] = useState([])
  const [shifts, setShifts] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [showUserModal, setShowUserModal] = useState(false)
  const [error, setError] = useState('')
  const { user: currentUser } = useAuth()
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', role: 'STAFF', teamId: '', shiftId: '' })
  const [createUserData, setCreateUserData] = useState({ username: '', password: '', firstName: '', lastName: '', email: '', phone: '', role: 'STAFF', teamId: '' })
  const [editingUser, setEditingUser] = useState(null)

  const teamsWithoutManager = teams.filter(t => !t.managerId || (editingUser && editingUser.teamId === t.id))
  const teamsWithoutTeamLead = teams.filter(t => !t.teamLeadId || (editingUser && editingUser.teamId === t.id))

  const getAvailableTeams = (role) => {
    if (role === 'MANAGER') return teamsWithoutManager
    if (role === 'TEAM_LEAD') return teamsWithoutTeamLead
    return teams
  }

  const createUserTeams = getAvailableTeams(createUserData.role)
  const editUserTeams = getAvailableTeams(formData.role)

  useEffect(() => { loadData() }, [])

  const loadData = async () => {
    try {
      const teamsPromise = teamService.getAll()
      const shiftsPromise = shiftService.getAll()
      const usersPromise = userService.getAll().catch(() => ({ data: [] }))
      const [usersRes, teamsRes, shiftsRes] = await Promise.all([usersPromise, teamsPromise, shiftsPromise])
      setUsers(usersRes.data)
      setTeams(teamsRes.data)
      setShifts(shiftsRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  const getErrorMessage = (err) => {
    if (err.response?.data?.errors) {
      const msgs = Object.values(err.response.data.errors)
      return msgs.join(', ')
    }
    return err.response?.data?.message || err.message || 'An unexpected error occurred'
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      const payload = { ...createUserData, teamId: createUserData.teamId || null, phone: createUserData.phone || null }
      await authService.createUser(payload)
      setShowUserModal(false)
      setCreateUserData({ username: '', password: '', firstName: '', lastName: '', email: '', phone: '', role: 'STAFF', teamId: '' })
      loadData()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally { setSubmitting(false) }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone || '', role: user.role, teamId: user.teamId || '', shiftId: user.shiftId || '' })
    setShowModal({ id: user.id })
  }

  const handleUpdate = async () => {
    setError('')
    setSubmitting(true)
    try {
      const payload = { ...formData, teamId: formData.teamId || null, shiftId: formData.shiftId || null }
      await userService.update(showModal.id, payload)
      setShowModal(false)
      setEditingUser(null)
      loadData()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally { setSubmitting(false) }
  }

  const handleResetPassword = async (id) => {
    if (confirm('Reset password to default?')) {
      try { await userService.resetPassword(id); alert('Password reset to: password123') }
      catch (err) { alert('Failed to reset') }
    }
  }

  const isManager = ['SUPER_ADMIN', 'MANAGER', 'TEAM_LEAD'].includes(currentUser?.role)

  if (loading) return <div className="text-center py-8"><div className="skeleton h-8 w-48 mx-auto mb-4" /><div className="skeleton h-64 w-full rounded-xl" /></div>

  if (!isManager) {
    return (
      <div className="empty-state card py-16">
        <svg className="w-16 h-16 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" /></svg>
        <h2 className="text-lg font-semibold text-slate-700 mb-1">Access Restricted</h2>
        <p className="empty-state-text mb-1">You do not have permission to access user management.</p>
        <p className="text-xs text-slate-400">Contact your manager or administrator for access.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Users</h1>
          <p className="text-sm text-slate-500 mt-1">Manage user accounts and roles</p>
        </div>
        {isManager && (
          <button onClick={() => setShowUserModal(true)} className="btn btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>
            Add User
          </button>
        )}
      </div>

      {users.length === 0 ? (
        <div className="empty-state card py-12">
          <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>
          <p className="empty-state-text">No users found.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Team</th>
                  <th>Shift</th>
                  {isManager && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="text-xs font-mono text-slate-500">{user.publicId || '-'}</td>
                    <td className="font-medium text-slate-900">{user.firstName} {user.lastName}</td>
                    <td className="text-slate-600">{user.username}</td>
                    <td className="text-slate-500">{user.email}</td>
                    <td><span className="badge badge-blue">{user.role}</span></td>
                    <td className="text-slate-500">{user.teamName || '-'}</td>
                    <td className="text-slate-500">{user.shiftName || '-'}</td>
                    {isManager && (
                      <td>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleEdit(user)} className="btn btn-ghost text-xs px-2 py-1">Edit</button>
                          <button onClick={() => handleResetPassword(user.id)} className="btn btn-ghost text-xs px-2 py-1 text-amber-600 hover:bg-amber-50">Reset</button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showUserModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowUserModal(false); setError('') }}}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Create User</h3>
              <button onClick={() => { setShowUserModal(false); setError('') }} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {error && <div className="mx-6 mt-4 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700"><svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>{error}</div>}
            <form onSubmit={handleSubmit}>
              <div className="modal-body space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Username</label>
                    <input type="text" placeholder="Username" className="input" value={createUserData.username} onChange={(e) => setCreateUserData({ ...createUserData, username: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
                    <input type="password" placeholder="Password" className="input" value={createUserData.password} onChange={(e) => setCreateUserData({ ...createUserData, password: e.target.value })} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
                    <input type="text" placeholder="First Name" className="input" value={createUserData.firstName} onChange={(e) => setCreateUserData({ ...createUserData, firstName: e.target.value })} required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
                    <input type="text" placeholder="Last Name" className="input" value={createUserData.lastName} onChange={(e) => setCreateUserData({ ...createUserData, lastName: e.target.value })} required />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                  <input type="email" placeholder="Email" className="input" value={createUserData.email} onChange={(e) => setCreateUserData({ ...createUserData, email: e.target.value })} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                  <input type="text" placeholder="Phone" className="input" value={createUserData.phone} onChange={(e) => setCreateUserData({ ...createUserData, phone: e.target.value })} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                    <select className="input" value={createUserData.role} onChange={(e) => setCreateUserData({ ...createUserData, role: e.target.value })}>
                      <option value="STAFF">Staff</option>
                      <option value="TEAM_LEAD">Team Lead</option>
                      <option value="MANAGER">Manager</option>
                      <option value="SUPER_ADMIN">Super Admin</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Team</label>
                    <select className="input" value={createUserData.teamId} onChange={(e) => setCreateUserData({ ...createUserData, teamId: e.target.value })}>
                      <option value="">Select Team</option>
                      {createUserTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => { setShowUserModal(false); setError('') }} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? (
                    <span className="flex items-center gap-2"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Creating...</span>
                  ) : 'Create User'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && typeof showModal === 'object' && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setShowModal(false); setError('') }}}>
          <div className="modal-content max-w-lg" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Edit User</h3>
              <button onClick={() => { setShowModal(false); setEditingUser(null); setError('') }} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {error && <div className="mx-6 mt-4 flex items-center gap-2 p-3 bg-rose-50 border border-rose-200 rounded-lg text-sm text-rose-700"><svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>{error}</div>}
            <div className="modal-body space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">First Name</label>
                  <input type="text" placeholder="First Name" className="input" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Last Name</label>
                  <input type="text" placeholder="Last Name" className="input" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                <input type="email" placeholder="Email" className="input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
                <input type="text" placeholder="Phone" className="input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1.5">Role</label>
                <select className="input" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                  <option value="STAFF">Staff</option>
                  <option value="TEAM_LEAD">Team Lead</option>
                  <option value="MANAGER">Manager</option>
                  <option value="SUPER_ADMIN">Super Admin</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Team</label>
                  <select className="input" value={formData.teamId} onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}>
                    <option value="">Select Team</option>
                    {editUserTeams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">Shift</label>
                  <select className="input" value={formData.shiftId} onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}>
                    <option value="">Select Shift</option>
                    {shifts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => { setShowModal(false); setEditingUser(null); setError('') }} className="btn btn-secondary">Cancel</button>
              <button onClick={handleUpdate} className="btn btn-primary" disabled={submitting}>
                {submitting ? (
                  <span className="flex items-center gap-2"><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>Updating...</span>
                ) : 'Update User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
