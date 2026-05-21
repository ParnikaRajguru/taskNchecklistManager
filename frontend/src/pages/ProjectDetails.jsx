import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { projectService, teamService, taskService } from '../services/api'
import { useAuth } from '../context/AuthContext'

function getStatusColor(status) {
  const colors = { TODO: 'blue', IN_PROGRESS: 'yellow', IN_REVIEW: 'purple', TESTING: 'orange', COMPLETED: 'green', BLOCKED: 'red' }
  return colors[status] || 'gray'
}
function getStatusLabel(status) {
  const labels = { TODO: 'Todo', IN_PROGRESS: 'In Progress', IN_REVIEW: 'In Review', TESTING: 'Testing', COMPLETED: 'Completed', BLOCKED: 'Blocked' }
  return labels[status] || status
}

export default function ProjectDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [project, setProject] = useState(null)
  const [teams, setTeams] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const isManager = ['SUPER_ADMIN', 'MANAGER'].includes(user?.role)

  useEffect(() => { loadData() }, [id])

  const loadData = async () => {
    try {
      const [projRes, teamsRes, tasksRes] = await Promise.all([
        projectService.getById(id),
        teamService.getByProject(id),
        taskService.getByProject(id)
      ])
      setProject(projRes.data)
      setTeams(teamsRes.data)
      setTasks(tasksRes.data)
    } catch (err) { console.error(err) }
    finally { setLoading(false) }
  }

  if (loading) return <div className="text-center py-8">Loading...</div>
  if (!project) return <div className="text-center py-8">Project not found</div>

  const activeTasks = tasks.filter(t => t.status !== 'COMPLETED')
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED')

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/projects')} className="text-blue-600 hover:text-blue-800 text-sm">&larr; Back to Projects</button>

      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
            <span className="text-xs font-mono text-gray-400">{project.publicId}</span>
          </div>
          <span className={`badge badge-${project.status === 'ACTIVE' ? 'green' : project.status === 'COMPLETED' ? 'blue' : 'gray'}`}>
            {project.status}
          </span>
        </div>
        <p className="text-gray-600 mb-4">{project.description || 'No description'}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-blue-50 p-3 rounded text-center"><p className="text-lg font-bold text-blue-600">{teams.length}</p><p className="text-xs text-gray-500">Teams</p></div>
          <div className="bg-green-50 p-3 rounded text-center"><p className="text-lg font-bold text-green-600">{activeTasks.length}</p><p className="text-xs text-gray-500">Active Tasks</p></div>
          <div className="bg-gray-50 p-3 rounded text-center"><p className="text-lg font-bold text-gray-600">{completedTasks.length}</p><p className="text-xs text-gray-500">Completed</p></div>
          <div className="bg-purple-50 p-3 rounded text-center"><p className="text-lg font-bold text-purple-600">{tasks.length}</p><p className="text-xs text-gray-500">Total Tasks</p></div>
        </div>
        {project.startDate && <p className="text-sm text-gray-500 mt-2">Started: {project.startDate}</p>}
        {project.endDate && <p className="text-sm text-gray-500">Due: {project.endDate}</p>}
      </div>

      <div className="card">
        <div className="bg-blue-50 px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-blue-800">Teams ({teams.length})</h2>
        </div>
        {teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {teams.map(team => (
              <div key={team.id} className="card cursor-pointer hover:shadow-lg transition-shadow" onClick={() => navigate(`/projects/${id}/teams/${team.id}`)}>
                <h3 className="font-semibold text-lg">{team.name}</h3>
                <p className="text-xs text-gray-400">{team.publicId}</p>
                <p className="text-gray-500 text-sm mt-1">{team.description || ''}</p>
                <div className="mt-2 flex gap-2 text-xs">
                  {team.teamLeadName && <span className="badge badge-green">Lead: {team.teamLeadName}</span>}
                  {team.managerName && <span className="badge badge-blue">Mgr: {team.managerName}</span>}
                </div>
                <div className="mt-2 flex gap-2 text-xs text-gray-500">
                  <span>{team.memberCount || 0} members</span>
                  <span>{team.taskCount || 0} tasks</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">No teams assigned to this project.</div>
        )}
      </div>

      <div className="card">
        <div className="bg-green-50 px-4 py-3 border-b">
          <h2 className="text-lg font-semibold text-green-800">Project Tasks Overview ({activeTasks.length} active)</h2>
        </div>
        {activeTasks.length > 0 ? (
          <table className="table">
            <thead><tr><th>Title</th><th>Team</th><th>Assigned To</th><th>Status</th><th>Priority</th><th>Due Date</th></tr></thead>
            <tbody>
              {activeTasks.map(task => (
                <tr key={task.id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/projects/${id}/teams/${task.teamId}/tasks/${task.id}`)}>
                  <td className="font-medium text-blue-600 hover:underline">{task.title}</td>
                  <td>{task.teamName || '-'}</td>
                  <td>{task.assignedToName || '-'}</td>
                  <td><span className={`badge badge-${getStatusColor(task.status)}`}>{getStatusLabel(task.status)}</span></td>
                  <td><span className={`badge badge-${task.priority === 'HIGH' ? 'red' : task.priority === 'MEDIUM' ? 'blue' : 'gray'}`}>{task.priority}</span></td>
                  <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-8 text-gray-500">No active tasks.</div>
        )}
      </div>
    </div>
  )
}
