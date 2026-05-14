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
      const payload = {
        ...createUserData,
        teamId: createUserData.teamId || null,
        phone: createUserData.phone || null
      }
      await authService.createUser(payload)
      setShowUserModal(false)
      setCreateUserData({ username: '', password: '', firstName: '', lastName: '', email: '', phone: '', role: 'STAFF', teamId: '' })
      loadData()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (user) => {
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      teamId: user.teamId || '',
      shiftId: user.shiftId || ''
    })
    setShowModal({ id: user.id })
  }

  const handleUpdate = async () => {
    setError('')
    setSubmitting(true)
    try {
      const payload = {
        ...formData,
        teamId: formData.teamId || null,
        shiftId: formData.shiftId || null
      }
      await userService.update(showModal.id, payload)
      setShowModal(false)
      loadData()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleResetPassword = async (id) => {
    if (confirm('Reset password to default?')) {
      try { await userService.resetPassword(id); alert('Password reset to: password123') }
      catch (err) { alert('Failed to reset') }
    }
  }

  const isManager = ['SUPER_ADMIN', 'MANAGER', 'TEAM_LEAD'].includes(currentUser?.role)

  if (loading) return <div className="text-center py-8">Loading...</div>

  if (!isManager) {
    return (
      <div className="card text-center py-12">
        <div className="text-6xl mb-4">🔒</div>
        <h2 className="text-xl font-semibold text-gray-700 mb-2">Access Restricted</h2>
        <p className="text-gray-500">You do not have permission to access user management.</p>
        <p className="text-gray-400 text-sm mt-2">Contact your manager or administrator for access.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Users</h1>
        {isManager && <button onClick={() => setShowUserModal(true)} className="btn btn-primary">Add User</button>}
      </div>

      {users.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500">No users found.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="table">
            <thead>
              <tr>
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
                  <td className="font-medium">{user.firstName} {user.lastName}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td><span className="badge badge-blue">{user.role}</span></td>
                  <td>{user.teamName || '-'}</td>
                  <td>{user.shiftName || '-'}</td>
                  {isManager && (
                    <td>
                      <button onClick={() => handleEdit(user)} className="text-blue-600 hover:text-blue-800 mr-2">Edit</button>
                      <button onClick={() => handleResetPassword(user.id)} className="text-yellow-600 hover:text-yellow-800">Reset</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Create User</h3>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="Username" className="input" value={createUserData.username} onChange={(e) => setCreateUserData({ ...createUserData, username: e.target.value })} required />
                <input type="password" placeholder="Password" className="input" value={createUserData.password} onChange={(e) => setCreateUserData({ ...createUserData, password: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="First Name" className="input" value={createUserData.firstName} onChange={(e) => setCreateUserData({ ...createUserData, firstName: e.target.value })} required />
                <input type="text" placeholder="Last Name" className="input" value={createUserData.lastName} onChange={(e) => setCreateUserData({ ...createUserData, lastName: e.target.value })} required />
              </div>
              <input type="email" placeholder="Email" className="input" value={createUserData.email} onChange={(e) => setCreateUserData({ ...createUserData, email: e.target.value })} required />
              <input type="text" placeholder="Phone" className="input" value={createUserData.phone} onChange={(e) => setCreateUserData({ ...createUserData, phone: e.target.value })} />
              <select className="input" value={createUserData.role} onChange={(e) => setCreateUserData({ ...createUserData, role: e.target.value })}>
                <option value="STAFF">Staff</option>
                <option value="TEAM_LEAD">Team Lead</option>
                <option value="MANAGER">Manager</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
              <select className="input" value={createUserData.teamId} onChange={(e) => setCreateUserData({ ...createUserData, teamId: e.target.value })}>
                <option value="">Select Team</option>
                {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <div className="flex gap-2">
                <button type="submit" className="btn btn-primary flex-1" disabled={submitting}>{submitting ? 'Creating...' : 'Create'}</button>
                <button type="button" onClick={() => { setShowUserModal(false); setError('') }} className="btn btn-secondary">Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && typeof showModal === 'object' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>
            {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">{error}</div>}
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input type="text" placeholder="First Name" className="input" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} />
                <input type="text" placeholder="Last Name" className="input" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} />
              </div>
              <input type="email" placeholder="Email" className="input" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              <input type="text" placeholder="Phone" className="input" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
              <select className="input" value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })}>
                <option value="STAFF">Staff</option>
                <option value="TEAM_LEAD">Team Lead</option>
                <option value="MANAGER">Manager</option>
                <option value="SUPER_ADMIN">Super Admin</option>
              </select>
              <div className="grid grid-cols-2 gap-4">
                <select className="input" value={formData.teamId} onChange={(e) => setFormData({ ...formData, teamId: e.target.value })}>
                  <option value="">Select Team</option>
                  {teams.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
                <select className="input" value={formData.shiftId} onChange={(e) => setFormData({ ...formData, shiftId: e.target.value })}>
                  <option value="">Select Shift</option>
                  {shifts.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <button onClick={handleUpdate} className="btn btn-primary flex-1" disabled={submitting}>{submitting ? 'Updating...' : 'Update'}</button>
                <button onClick={() => { setShowModal(false); setError('') }} className="btn btn-secondary">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
