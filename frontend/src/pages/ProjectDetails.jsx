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

  if (loading) return <div className="text-center py-8"><div className="skeleton h-8 w-64 mx-auto mb-4" /><div className="skeleton h-48 w-full rounded-xl mb-4" /><div className="skeleton h-32 w-full rounded-xl" /></div>
  if (!project) return <div className="empty-state card py-12"><p className="empty-state-text">Project not found</p></div>

  const activeTasks = tasks.filter(t => t.status !== 'COMPLETED')
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED')

  return (
    <div className="space-y-6 animate-fade-in">
      <button onClick={() => navigate('/projects')} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" /></svg>
        Back to Projects
      </button>

      <div className="card p-6">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-bold text-slate-900">{project.name}</h1>
            <span className="text-xs font-mono text-slate-400">{project.publicId}</span>
          </div>
          <span className={`badge badge-${project.status === 'ACTIVE' ? 'green' : project.status === 'COMPLETED' ? 'blue' : 'gray'} shrink-0`}>
            {project.status}
          </span>
        </div>
        <p className="text-sm text-slate-600 mb-5">{project.description || 'No description'}</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="bg-primary-50/50 rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-primary-600">{teams.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Teams</p>
          </div>
          <div className="bg-emerald-50/50 rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-emerald-600">{activeTasks.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Active Tasks</p>
          </div>
          <div className="bg-slate-50 rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-slate-600">{completedTasks.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Completed</p>
          </div>
          <div className="bg-violet-50/50 rounded-xl p-4 text-center">
            <p className="text-xl font-bold text-violet-600">{tasks.length}</p>
            <p className="text-xs text-slate-500 mt-0.5">Total Tasks</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-slate-500">
          {project.startDate && <span>Started: {project.startDate}</span>}
          {project.endDate && <span>Due: {project.endDate}</span>}
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="section-header px-5 py-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" /></svg>
            <h2 className="section-title">Teams ({teams.length})</h2>
          </div>
        </div>
        {teams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-5">
            {teams.map(team => (
              <div key={team.id} className="card card-hover p-5" onClick={() => navigate(`/projects/${id}/teams/${team.id}`)}>
                <h3 className="font-semibold text-slate-900">{team.name}</h3>
                <p className="text-xs text-slate-400 font-mono">{team.publicId}</p>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{team.description || ''}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  {team.teamLeadName && <span className="badge badge-green">Lead: {team.teamLeadName}</span>}
                  {team.managerName && <span className="badge badge-blue">Mgr: {team.managerName}</span>}
                </div>
                <div className="flex gap-3 mt-3 text-xs text-slate-500">
                  <span>{team.memberCount || 0} members</span>
                  <span>{team.taskCount || 0} tasks</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state py-8"><p className="empty-state-text">No teams assigned to this project.</p></div>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="section-header px-5 py-4 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 002.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08" /></svg>
            <h2 className="section-title text-emerald-800">Project Tasks Overview ({activeTasks.length} active)</h2>
          </div>
        </div>
        {activeTasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="table">
              <thead><tr><th>Title</th><th>Team</th><th>Assigned To</th><th>Status</th><th>Priority</th><th>Due Date</th></tr></thead>
              <tbody>
                {activeTasks.map(task => (
                  <tr key={task.id} className="cursor-pointer" onClick={() => navigate(`/projects/${id}/teams/${task.teamId}/tasks/${task.id}`)}>
                    <td className="font-medium text-primary-600 hover:underline">{task.title}</td>
                    <td>{task.teamName || '-'}</td>
                    <td>{task.assignedToName || '-'}</td>
                    <td><span className={`badge badge-${getStatusColor(task.status)}`}>{getStatusLabel(task.status)}</span></td>
                    <td><span className={`badge badge-${task.priority === 'HIGH' ? 'red' : task.priority === 'MEDIUM' ? 'blue' : 'gray'}`}>{task.priority}</span></td>
                    <td className="text-slate-500">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state py-8"><p className="empty-state-text">No active tasks.</p></div>
        )}
      </div>
    </div>
  )
}
