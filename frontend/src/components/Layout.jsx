import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/tasks', label: 'Tasks', icon: '✅' },
    { path: '/projects', label: 'Projects', icon: '📁' },
    { path: '/teams', label: 'Teams', icon: '👥' },
    { path: '/users', label: 'Users', icon: '👤' },
    { path: '/shifts', label: 'Shifts', icon: '⏰' },
    { path: '/checklists', label: 'Checklists', icon: '📋' },
    { path: '/handovers', label: 'Handovers', icon: '🔄' }
  ]

  const isManager = ['SUPER_ADMIN', 'PROJECT_MANAGER', 'MANAGER'].includes(user?.role)

  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-xl font-bold">Task Manager</h1>
          <p className="text-sm text-gray-400 mt-1">Store Operations</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-400">{user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full btn btn-secondary text-sm"
          >
            Logout
          </button>
        </div>
      </aside>
      
      <main className="flex-1 overflow-auto">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">
            Welcome, {user?.firstName}
          </h2>
          {user?.firstLogin && (
            <button
              onClick={() => setShowPasswordModal(true)}
              className="btn btn-primary text-sm"
            >
              Change Password
            </button>
          )}
        </header>
        
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {showPasswordModal && (
        <PasswordModal onClose={() => setShowPasswordModal(false)} />
      )}
    </div>
  )
}

function PasswordModal({ onClose }) {
  const { changePassword } = useAuth()
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match')
      return
    }
    
    try {
      await changePassword(formData)
      setSuccess(true)
      setTimeout(() => onClose(), 1500)
    } catch (err) {
      setError(err.response?.data || 'Failed to change password')
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96">
        <h3 className="text-lg font-semibold mb-4">Change Password</h3>
        
        {success ? (
          <div className="text-green-600">Password changed successfully!</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="Current Password"
              className="input"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
            />
            <input
              type="password"
              placeholder="New Password"
              className="input"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              className="input"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
            />
            
            {error && <p className="text-red-600 text-sm">{error}</p>}
            
            <div className="flex gap-2">
              <button type="submit" className="btn btn-primary flex-1">
                Change
              </button>
              <button type="button" onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}