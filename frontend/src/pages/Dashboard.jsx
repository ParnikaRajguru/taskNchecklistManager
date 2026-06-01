import { useState, useEffect } from 'react'
import { dashboardService } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      const response = await dashboardService.getData()
      setData(response.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const statIcons = {
    'Total Tasks': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>,
    'Pending': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    'Completed': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    'Overdue': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>,
    'Total Projects': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" /></svg>,
    'Total Teams': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>,
    'Pending Checklist': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    'Delayed Checklists': <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>,
  }

  const statColors = {
    'Total Tasks': { bg: 'bg-primary-100', text: 'text-primary-600', icon: 'text-primary-600' },
    'Pending': { bg: 'bg-amber-100', text: 'text-amber-600', icon: 'text-amber-600' },
    'Completed': { bg: 'bg-emerald-100', text: 'text-emerald-600', icon: 'text-emerald-600' },
    'Overdue': { bg: 'bg-rose-100', text: 'text-rose-600', icon: 'text-rose-600' },
    'Total Projects': { bg: 'bg-violet-100', text: 'text-violet-600', icon: 'text-violet-600' },
    'Total Teams': { bg: 'bg-cyan-100', text: 'text-cyan-600', icon: 'text-cyan-600' },
    'Pending Checklist': { bg: 'bg-orange-100', text: 'text-orange-600', icon: 'text-orange-600' },
    'Delayed Checklists': { bg: 'bg-pink-100', text: 'text-pink-600', icon: 'text-pink-600' },
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="stat-card">
              <div className="skeleton h-10 w-10 rounded-lg" />
              <div className="skeleton h-8 w-20 mt-3" />
              <div className="skeleton h-3 w-24 mt-2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const stats = [
    { label: 'Total Tasks', value: data?.totalTasks || 0 },
    { label: 'Pending', value: data?.pendingTasks || 0 },
    { label: 'Completed', value: data?.completedTasks || 0 },
    { label: 'Overdue', value: data?.overdueTasks || 0 },
    { label: 'Total Projects', value: data?.totalProjects || 0 },
    { label: 'Total Teams', value: data?.totalTeams || 0 },
    { label: 'Pending Checklist', value: data?.pendingChecklistItemsCount || 0 },
    { label: 'Delayed Checklists', value: data?.delayedChecklists || 0 }
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Overview of your store operations</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const colors = statColors[stat.label] || { bg: 'bg-slate-100', text: 'text-slate-600', icon: 'text-slate-600' }
          return (
            <div key={stat.label} className="stat-card animate-fade-in-up">
              <div className={`stat-card-icon ${colors.bg} ${colors.icon}`}>
                {statIcons[stat.label] || null}
              </div>
              <p className="stat-card-value">{stat.value}</p>
              <p className="stat-card-label">{stat.label}</p>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08" /></svg>
              <h3 className="text-sm font-semibold text-slate-900">Recent Tasks</h3>
            </div>
          </div>
          <div className="p-5">
            {data?.recentTasks?.length > 0 ? (
              <div className="space-y-2">
                {data.recentTasks.slice(0, 5).map((task) => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-primary-50/50 transition-colors">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-slate-900 text-sm truncate">{task.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {task.projectName} - {task.teamName}
                      </p>
                    </div>
                    <span className={`badge badge-${getStatusColor(task.status)} ml-3 shrink-0`}>
                      {task.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 00.75-.75 2.25 2.25 0 00-.1-.664m-5.8 0A2.251 2.251 0 0113.5 2.25H15a2.25 2.25 0 012.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25zM6.75 12h.008v.008H6.75V12zm0 3h.008v.008H6.75V15zm0 3h.008v.008H6.75V18z" /></svg>
                <p className="empty-state-text">No tasks found</p>
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <h3 className="text-sm font-semibold text-slate-900">Pending Checklist Items</h3>
            </div>
          </div>
          <div className="p-5">
            {data?.pendingChecklistItems?.length > 0 ? (
              <div className="space-y-2">
                {data.pendingChecklistItems.slice(0, 5).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-primary-50/50 transition-colors">
                    <p className="font-medium text-slate-900 text-sm truncate">{item.title}</p>
                    {item.assignedToName && (
                      <span className="text-xs text-slate-500 ml-3 shrink-0">{item.assignedToName}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <svg className="empty-state-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="empty-state-text">No pending items</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function getStatusColor(status) {
  const colors = {
    TODO: 'blue',
    IN_PROGRESS: 'yellow',
    IN_REVIEW: 'purple',
    TESTING: 'orange',
    COMPLETED: 'green',
    BLOCKED: 'red'
  }
  return colors[status] || 'gray'
}
