package com.store.taskmanager.service;

import com.store.taskmanager.dto.*;
import com.store.taskmanager.entity.User;
import com.store.taskmanager.entity.enums.TaskStatus;
import com.store.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TaskRepository taskRepository;
    private final HandoverRepository handoverRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final ChecklistRepository checklistRepository;

    public DashboardDTO getDashboardData(User user) {
        DashboardDTO dashboard = new DashboardDTO();

        Long shiftId = null;
        if (user.getShift() != null) {
            shiftId = user.getShift().getId();
        }

        boolean isManager = user.getRole().name().equals("SUPER_ADMIN") ||
                          user.getRole().name().equals("MANAGER");

        List<com.store.taskmanager.entity.Task> allTasks;
        if (isManager) {
            allTasks = taskRepository.findAll();
        } else if (user.getTeam() != null) {
            List<com.store.taskmanager.entity.Task> teamTasks = taskRepository.findByTeamId(user.getTeam().getId());
            List<com.store.taskmanager.entity.Task> assignedTasks = taskRepository.findByAssignedToId(user.getId());
            allTasks = new java.util.ArrayList<>(teamTasks);
            for (com.store.taskmanager.entity.Task t : assignedTasks) {
                if (allTasks.stream().noneMatch(ct -> ct.getId().equals(t.getId()))) {
                    allTasks.add(t);
                }
            }
        } else {
            allTasks = taskRepository.findByAssignedToId(user.getId());
        }

        dashboard.setTotalTasks((long) allTasks.size());
        List<com.store.taskmanager.entity.Task> pending = allTasks.stream()
                .filter(t -> t.getStatus() != TaskStatus.COMPLETED)
                .collect(Collectors.toList());
        dashboard.setPendingTasks((long) pending.size());
        dashboard.setCompletedTasks(allTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.COMPLETED)
                .count());

        LocalDateTime todayStart = LocalDate.now().atStartOfDay();
        LocalDateTime todayEnd = todayStart.plusDays(1);

        long completedToday = allTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.COMPLETED
                        && t.getUpdatedAt() != null
                        && t.getUpdatedAt().isAfter(todayStart)
                        && t.getUpdatedAt().isBefore(todayEnd))
                .count();
        dashboard.setCompletedToday(completedToday);

        dashboard.setOverdueTasks(allTasks.stream()
                .filter(t -> t.getDueDate() != null &&
                           t.getDueDate().isBefore(LocalDate.now()) &&
                           t.getStatus() != TaskStatus.COMPLETED)
                .count());
        dashboard.setBlockedTasks(allTasks.stream()
                .filter(t -> t.getStatus() == TaskStatus.BLOCKED)
                .count());

        dashboard.setDelayedChecklists((long) checklistRepository.findDelayedChecklists(LocalDateTime.now()).size());

        boolean isLeadOrAbove = isManager || user.getRole().name().equals("TEAM_LEAD");

        if (isLeadOrAbove) {
            dashboard.setMissedHandovers((long) handoverRepository.findMissedHandovers().size());
            dashboard.setPendingApprovals(dashboard.getPendingTasks());
        } else {
            dashboard.setMissedHandovers(0L);
            dashboard.setPendingApprovals(0L);
        }

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
            dashboard.setPendingChecklistItemsCount((long) pendingItems.size());
        } else {
            dashboard.setPendingChecklistItemsCount(0L);
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

        if (handover.getAssignedTeam() != null) {
            dto.setAssignedTeamId(handover.getAssignedTeam().getId());
            dto.setAssignedTeamName(handover.getAssignedTeam().getName());
        }

        if (handover.getReceivingTeam() != null) {
            dto.setReceivingTeamId(handover.getReceivingTeam().getId());
            dto.setReceivingTeamName(handover.getReceivingTeam().getName());
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

        return dto;
    }
}
