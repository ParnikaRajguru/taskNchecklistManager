package com.store.taskmanager.service;

import com.store.taskmanager.dto.*;
import com.store.taskmanager.entity.*;
import com.store.taskmanager.exception.ResourceNotFoundException;
import com.store.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChecklistService {
    
    private final ChecklistRepository checklistRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final ProjectRepository projectRepository;
    private final ShiftRepository shiftRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final AuditLogService auditLogService;
    
    public List<ChecklistDTO> getAllChecklists() {
        return checklistRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public ChecklistDTO getChecklistById(Long id) {
        Checklist checklist = checklistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist not found with id: " + id));
        return mapToDTO(checklist);
    }
    
    public List<ChecklistDTO> getChecklistsByShift(Long shiftId) {
        return checklistRepository.findByShiftId(shiftId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<ChecklistDTO> getChecklistsByTeam(Long teamId) {
        return checklistRepository.findByTeamId(teamId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<ChecklistDTO> getChecklistsByTask(Long taskId) {
        return checklistRepository.findByTaskId(taskId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public ChecklistDTO createChecklist(CreateChecklistRequest request, User currentUser) {
        Checklist checklist = new Checklist();
        checklist.setTitle(request.getTitle());
        checklist.setDescription(request.getDescription());
        checklist.setCreatedBy(currentUser);
        
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
            checklist.setProject(project);
        }

        if (request.getShiftId() != null) {
            Shift shift = shiftRepository.findById(request.getShiftId())
                    .orElseThrow(() -> new ResourceNotFoundException("Shift not found"));
            checklist.setShift(shift);
        }
        
        if (request.getTeamId() != null) {
            Team team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
            checklist.setTeam(team);
        }

        if (request.getTaskId() != null) {
            Task task = taskRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
            checklist.setTask(task);
        }
        
        if (request.getItems() != null && !request.getItems().isEmpty()) {
            List<ChecklistItem> items = new ArrayList<>();
            for (CreateChecklistItemRequest itemRequest : request.getItems()) {
                ChecklistItem item = new ChecklistItem();
                item.setTitle(itemRequest.getTitle());
                item.setDescription(itemRequest.getDescription());
                item.setChecklist(checklist);
                
                if (itemRequest.getAssignedToId() != null) {
                    User assignedTo = userRepository.findById(itemRequest.getAssignedToId())
                            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                    item.setAssignedTo(assignedTo);
                }
                
                if (itemRequest.getTaskId() != null) {
                    Task task = taskRepository.findById(itemRequest.getTaskId())
                            .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
                    item.setTask(task);
                }
                
                items.add(item);
            }
            checklist.setItems(items);
        }
        
        checklistRepository.save(checklist);
        
        auditLogService.log("CHECKLIST_CREATED", "Checklist", checklist.getId(), null, "checklist created: " + checklist.getTitle(), currentUser);
        
        return mapToDTO(checklist);
    }
    
    @Transactional
    public ChecklistItemDTO completeItem(Long itemId, User currentUser) {
        ChecklistItem item = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist item not found with id: " + itemId));
        
        item.setCompleted(true);
        item.setCompletedBy(currentUser);
        item.setCompletedAt(LocalDateTime.now());
        
        checklistItemRepository.save(item);
        
        auditLogService.log("CHECKLIST_ITEM_COMPLETED", "ChecklistItem", itemId, null, "item completed: " + item.getTitle(), currentUser);
        
        return mapItemToDTO(item);
    }
    
    @Transactional
    public ChecklistItemDTO uncompleteItem(Long itemId, User currentUser) {
        ChecklistItem item = checklistItemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist item not found with id: " + itemId));
        
        item.setCompleted(false);
        item.setCompletedBy(null);
        item.setCompletedAt(null);
        
        checklistItemRepository.save(item);
        
        auditLogService.log("CHECKLIST_ITEM_UNCOMPLETED", "ChecklistItem", itemId, null, "item uncompleted: " + item.getTitle(), currentUser);
        
        return mapItemToDTO(item);
    }
    
    @Transactional
    public void deleteChecklist(Long id, User currentUser) {
        Checklist checklist = checklistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist not found with id: " + id));
        
        auditLogService.log("CHECKLIST_DELETED", "Checklist", id, null, "checklist deleted: " + checklist.getTitle(), currentUser);
        
        checklistRepository.delete(checklist);
    }
    
    private ChecklistDTO mapToDTO(Checklist checklist) {
        ChecklistDTO dto = new ChecklistDTO();
        dto.setId(checklist.getId());
        dto.setTitle(checklist.getTitle());
        dto.setDescription(checklist.getDescription());
        dto.setCreatedAt(checklist.getCreatedAt());
        
        if (checklist.getProject() != null) {
            dto.setProjectId(checklist.getProject().getId());
            dto.setProjectName(checklist.getProject().getName());
        }

        if (checklist.getShift() != null) {
            dto.setShiftId(checklist.getShift().getId());
            dto.setShiftName(checklist.getShift().getName());
        }
        
        if (checklist.getTeam() != null) {
            dto.setTeamId(checklist.getTeam().getId());
            dto.setTeamName(checklist.getTeam().getName());
        }

        if (checklist.getTask() != null) {
            dto.setTaskId(checklist.getTask().getId());
            dto.setTaskTitle(checklist.getTask().getTitle());
        }
        
        if (checklist.getCreatedBy() != null) {
            dto.setCreatedById(checklist.getCreatedBy().getId());
            dto.setCreatedByName(checklist.getCreatedBy().getFullName());
        }
        
        if (checklist.getItems() != null && !checklist.getItems().isEmpty()) {
            dto.setItems(checklist.getItems().stream()
                    .map(this::mapItemToDTO)
                    .collect(Collectors.toList()));
            long completed = checklist.getItems().stream().filter(ChecklistItem::isCompleted).count();
            dto.setProgressPercentage((int) (completed * 100 / checklist.getItems().size()));
        } else {
            dto.setProgressPercentage(0);
        }
        
        return dto;
    }
    
    private ChecklistItemDTO mapItemToDTO(ChecklistItem item) {
        ChecklistItemDTO dto = new ChecklistItemDTO();
        dto.setId(item.getId());
        dto.setTitle(item.getTitle());
        dto.setDescription(item.getDescription());
        dto.setCompleted(item.isCompleted());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setCompletedAt(item.getCompletedAt());
        
        if (item.getChecklist() != null) {
            dto.setChecklistId(item.getChecklist().getId());
        }
        
        if (item.getAssignedTo() != null) {
            dto.setAssignedToId(item.getAssignedTo().getId());
            dto.setAssignedToName(item.getAssignedTo().getFullName());
        }
        
        if (item.getTask() != null) {
            dto.setTaskId(item.getTask().getId());
            dto.setTaskTitle(item.getTask().getTitle());
        }
        
        if (item.getCompletedBy() != null) {
            dto.setCompletedById(item.getCompletedBy().getId());
            dto.setCompletedByName(item.getCompletedBy().getFullName());
        }
        
        return dto;
    }
}