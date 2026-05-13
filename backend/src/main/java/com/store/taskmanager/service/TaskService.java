package com.store.taskmanager.service;

import com.store.taskmanager.dto.*;
import com.store.taskmanager.entity.*;
import com.store.taskmanager.entity.enums.TaskStatus;
import com.store.taskmanager.exception.ResourceNotFoundException;
import com.store.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TaskService {
    
    private final TaskRepository taskRepository;
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final NoteRepository noteRepository;
    private final ShiftRepository shiftRepository;
    private final AuditLogService auditLogService;
    
    public List<TaskDTO> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public TaskDTO getTaskById(Long id) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        return mapToDTO(task);
    }
    
    public List<TaskDTO> getTasksByProject(Long projectId) {
        return taskRepository.findByProjectId(projectId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<TaskDTO> getTasksByTeam(Long teamId) {
        return taskRepository.findByTeamId(teamId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getTasksByShift(Long shiftId) {
        return taskRepository.findByShiftId(shiftId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<TaskDTO> getTasksByUser(Long userId) {
        return taskRepository.findByAssignedToId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<TaskDTO> getPendingTasksByUser(Long userId) {
        return taskRepository.findPendingTasksByUserId(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<TaskDTO> getAccessibleTasks(User user) {
        if (user.getTeam() == null) {
            return getTasksByUser(user.getId());
        }
        List<Task> teamTasks = taskRepository.findByTeamId(user.getTeam().getId());
        List<Task> assignedTasks = taskRepository.findByAssignedToId(user.getId());
        List<Task> combined = new java.util.ArrayList<>(teamTasks);
        for (Task t : assignedTasks) {
            if (combined.stream().noneMatch(ct -> ct.getId().equals(t.getId()))) {
                combined.add(t);
            }
        }
        return combined.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getOverdueTasks() {
        return taskRepository.findOverdueTasks(LocalDateTime.now()).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public TaskDTO createTask(CreateTaskRequest request, User currentUser) {
        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO);
        task.setPriority(request.getPriority() != null ? request.getPriority() : com.store.taskmanager.entity.enums.TaskPriority.MEDIUM);
        task.setDueDate(request.getDueDate());
        task.setCreatedBy(currentUser);
        
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
            task.setProject(project);
        }
        
        if (request.getTeamId() != null) {
            Team team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
            task.setTeam(team);
        }
        
        if (request.getAssignedToId() != null) {
            User assignedTo = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            task.setAssignedTo(assignedTo);
        }

        if (request.getShiftId() != null) {
            Shift shift = shiftRepository.findById(request.getShiftId())
                    .orElseThrow(() -> new ResourceNotFoundException("Shift not found"));
            task.setShift(shift);
        }
        
        taskRepository.save(task);
        
        auditLogService.log("TASK_CREATED", "Task", task.getId(), null, "task created: " + task.getTitle(), currentUser);
        
        return mapToDTO(task);
    }
    
    @Transactional
    public TaskDTO updateTask(Long id, UpdateTaskRequest request, User currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        
        String oldStatus = task.getStatus().name();
        
        if (request.getTitle() != null) task.setTitle(request.getTitle());
        if (request.getDescription() != null) task.setDescription(request.getDescription());
        if (request.getStatus() != null) task.setStatus(request.getStatus());
        if (request.getPriority() != null) task.setPriority(request.getPriority());
        if (request.getDueDate() != null) task.setDueDate(request.getDueDate());
        
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
            task.setProject(project);
        }
        
        if (request.getTeamId() != null) {
            Team team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
            task.setTeam(team);
        }
        
        if (request.getAssignedToId() != null) {
            User assignedTo = userRepository.findById(request.getAssignedToId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            task.setAssignedTo(assignedTo);
        }

        if (request.getShiftId() != null) {
            Shift shift = shiftRepository.findById(request.getShiftId())
                    .orElseThrow(() -> new ResourceNotFoundException("Shift not found"));
            task.setShift(shift);
        }
        
        taskRepository.save(task);
        
        if (request.getStatus() != null && !oldStatus.equals(request.getStatus().name())) {
            auditLogService.log("STATUS_CHANGED", "Task", id, oldStatus, request.getStatus().name(), currentUser);
        }
        
        auditLogService.log("TASK_UPDATED", "Task", id, null, "task updated: " + task.getTitle(), currentUser);
        
        return mapToDTO(task);
    }
    
    @Transactional
    public void deleteTask(Long id, User currentUser) {
        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + id));
        
        auditLogService.log("TASK_DELETED", "Task", id, null, "task deleted: " + task.getTitle(), currentUser);
        
        taskRepository.delete(task);
    }
    
    private TaskDTO mapToDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setStatus(task.getStatus());
        dto.setPriority(task.getPriority());
        dto.setDueDate(task.getDueDate());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        
        if (task.getProject() != null) {
            dto.setProjectId(task.getProject().getId());
            dto.setProjectName(task.getProject().getName());
        }
        
        if (task.getTeam() != null) {
            dto.setTeamId(task.getTeam().getId());
            dto.setTeamName(task.getTeam().getName());
        }

        if (task.getShift() != null) {
            dto.setShiftId(task.getShift().getId());
            dto.setShiftName(task.getShift().getName());
        }
        
        if (task.getAssignedTo() != null) {
            dto.setAssignedToId(task.getAssignedTo().getId());
            dto.setAssignedToName(task.getAssignedTo().getFullName());
        }
        
        if (task.getCreatedBy() != null) {
            dto.setCreatedById(task.getCreatedBy().getId());
            dto.setCreatedByName(task.getCreatedBy().getFullName());
        }
        
        if (task.getNotes() != null) {
            dto.setNotes(task.getNotes().stream()
                    .map(this::mapNoteToDTO)
                    .collect(Collectors.toList()));
        }

        if (task.getChecklistItems() != null) {
            dto.setChecklistCount(task.getChecklistItems().size());
        }
        
        return dto;
    }
    
    private NoteDTO mapNoteToDTO(Note note) {
        NoteDTO dto = new NoteDTO();
        dto.setId(note.getId());
        dto.setContent(note.getContent());
        dto.setCreatedAt(note.getCreatedAt());
        
        if (note.getCreatedBy() != null) {
            dto.setCreatedById(note.getCreatedBy().getId());
            dto.setCreatedByName(note.getCreatedBy().getFullName());
        }
        
        if (note.getTask() != null) {
            dto.setTaskId(note.getTask().getId());
        }
        
        return dto;
    }
}