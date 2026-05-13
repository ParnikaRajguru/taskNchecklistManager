package com.store.taskmanager.service;

import com.store.taskmanager.dto.*;
import com.store.taskmanager.entity.User;
import com.store.taskmanager.entity.enums.TaskStatus;
import com.store.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {
    
    private final TaskRepository taskRepository;
    private final HandoverRepository handoverRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final ShiftRepository shiftRepository;
    
    public DashboardDTO getDashboardData(User user) {
        DashboardDTO dashboard = new DashboardDTO();
        
        List<Long> teamIds = null;
        Long shiftId = null;
        
        if (user.getTeam() != null) {
            teamIds = teamRepository.findByProjectId(user.getTeam().getProject() != null ? 
                    user.getTeam().getProject().getId() : null).stream()
                    .map(Team -> Team.getId())
                    .collect(Collectors.toList());
        }
        
        if (user.getShift() != null) {
            shiftId = user.getShift().getId();
        }
        
        List<com.store.taskmanager.entity.Task> allTasks;
        if (user.getRole().name().equals("SUPER_ADMIN") || 
            user.getRole().name().equals("PROJECT_MANAGER") || 
            user.getRole().name().equals("MANAGER")) {
            allTasks = taskRepository.findAll();
        } else if (teamIds != null && !teamIds.isEmpty()) {
            allTasks = teamIds.stream()
                    .flatMap(tid -> taskRepository.findByTeamId(tid).stream())
                    .collect(Collectors.toList());
        } else {
            allTasks = taskRepository.findByAssignedToId(user.getId());
        }
        
        dashboard.setTotalTasks((long) allTasks.size());
        dashboard.setPendingTasks(allTasks.stream()
                .filter(t -> t.getStatus() != TaskStatus.COMPLETED)
                .count());
        dashboard.setCompletedTasks(allTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.COMPLETED)
                .count());
        dashboard.setOverdueTasks(allTasks.stream()
                .filter(t -> t.getDueDate() != null && 
                           t.getDueDate().isBefore(LocalDateTime.now()) && 
                           t.getStatus() != TaskStatus.COMPLETED)
                .count());
        dashboard.setBlockedTasks(allTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.BLOCKED)
                .count());
        
        List<com.store.taskmanager.entity.Task> recentTasks = allTasks.stream()
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .limit(10)
                .collect(Collectors.toList());
        
        dashboard.setRecentTasks(recentTasks.stream()
                .map(this::mapTaskToDTO)
                .collect(Collectors.toList()));
        
        if (shiftId != null) {
            List<com.store.taskmanager.entity.Handover> pendingHandovers = 
                    handoverRepository.findUnresolvedByShiftId(shiftId);
            dashboard.setPendingHandovers(pendingHandovers.stream()
                    .map(this::mapHandoverToDTO)
                    .collect(Collectors.toList()));
            
            List<com.store.taskmanager.entity.ChecklistItem> pendingItems = 
                    checklistItemRepository.findPendingItemsByShiftId(shiftId);
            dashboard.setPendingChecklistItems(pendingItems.stream()
                    .map(this::mapChecklistItemToDTO)
                    .collect(Collectors.toList()));
        }
        
        return dashboard;
    }
    
    private TaskDTO mapTaskToDTO(com.store.taskmanager.entity.Task task) {
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
        
        if (task.getAssignedTo() != null) {
            dto.setAssignedToId(task.getAssignedTo().getId());
            dto.setAssignedToName(task.getAssignedTo().getFullName());
        }
        
        return dto;
    }
    
    private HandoverDTO mapHandoverToDTO(com.store.taskmanager.entity.Handover handover) {
        HandoverDTO dto = new HandoverDTO();
        dto.setId(handover.getId());
        dto.setTitle(handover.getTitle());
        dto.setCompletedWork(handover.getCompletedWork());
        dto.setPendingWork(handover.getPendingWork());
        dto.setBlockers(handover.getBlockers());
        dto.setNextShiftInstructions(handover.getNextShiftInstructions());
        dto.setResolved(handover.isResolved());
        dto.setCreatedAt(handover.getCreatedAt());
        
        if (handover.getFromShift() != null) {
            dto.setFromShiftId(handover.getFromShift().getId());
            dto.setFromShiftName(handover.getFromShift().getName());
        }
        
        if (handover.getToShift() != null) {
            dto.setToShiftId(handover.getToShift().getId());
            dto.setToShiftName(handover.getToShift().getName());
        }
        
        if (handover.getCreatedBy() != null) {
            dto.setCreatedById(handover.getCreatedBy().getId());
            dto.setCreatedByName(handover.getCreatedBy().getFullName());
        }
        
        return dto;
    }
    
    private ChecklistItemDTO mapChecklistItemToDTO(com.store.taskmanager.entity.ChecklistItem item) {
        ChecklistItemDTO dto = new ChecklistItemDTO();
        dto.setId(item.getId());
        dto.setTitle(item.getTitle());
        dto.setDescription(item.getDescription());
        dto.setCompleted(item.isCompleted());
        dto.setCreatedAt(item.getCreatedAt());
        dto.setCompletedAt(item.getCompletedAt());
        
        if (item.getAssignedTo() != null) {
            dto.setAssignedToId(item.getAssignedTo().getId());
            dto.setAssignedToName(item.getAssignedTo().getFullName());
        }
        
        if (item.getTask() != null) {
            dto.setTaskId(item.getTask().getId());
            dto.setTaskTitle(item.getTask().getTitle());
        }
        
        return dto;
    }
}