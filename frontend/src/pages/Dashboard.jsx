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

  if (loading) {
    return <div className="text-center py-8">Loading...</div>
  }

  const stats = [
    { label: 'Total Tasks', value: data?.totalTasks || 0, color: 'blue' },
    { label: 'Pending', value: data?.pendingTasks || 0, color: 'yellow' },
    { label: 'Completed', value: data?.completedTasks || 0, color: 'green' },
    { label: 'Overdue', value: data?.overdueTasks || 0, color: 'red' },
    { label: 'Total Projects', value: data?.totalProjects || 0, color: 'indigo' },
    { label: 'Total Teams', value: data?.totalTeams || 0, color: 'cyan' },
    { label: 'Pending Checklist', value: data?.pendingChecklistItemsCount || 0, color: 'orange' },
    { label: 'Delayed Checklists', value: data?.delayedChecklists || 0, color: 'pink' }
  ]

  const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(user?.role)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="card">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-2xl font-bold text-${stat.color}-600`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Recent Tasks</h3>
          <div className="space-y-3">
            {data?.recentTasks?.length > 0 ? (
              data.recentTasks.slice(0, 5).map((task) => (
                <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{task.title}</p>
                    <p className="text-sm text-gray-500">
                      {task.projectName} - {task.teamName}
                    </p>
                  </div>
                  <span className={`badge badge-${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No tasks found</p>
            )}
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold mb-4">Pending Checklist Items</h3>
          <div className="space-y-3">
            {data?.pendingChecklistItems?.length > 0 ? (
              data.pendingChecklistItems.slice(0, 5).map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-800">{item.title}</p>
                  </div>
                  {item.assignedToName && (
                    <span className="text-sm text-gray-500">{item.assignedToName}</span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No pending items</p>
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
