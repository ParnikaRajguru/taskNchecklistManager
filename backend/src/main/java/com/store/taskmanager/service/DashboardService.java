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
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;

    public DashboardDTO getDashboardData(User user) {
        DashboardDTO dashboard = new DashboardDTO();

        Long shiftId = null;
        if (user.getShift() != null) {
            shiftId = user.getShift().getId();
        }

        String role = user.getRole().name();
        boolean isManager = role.equals("SUPER_ADMIN") || role.equals("MANAGER");

        List<com.store.taskmanager.entity.Task> allTasks;
        if (role.equals("SUPER_ADMIN")) {
            allTasks = taskRepository.findAll();
        } else if (role.equals("MANAGER")) {
            allTasks = taskRepository.findByTeamManagerId(user.getId());
        } else if (role.equals("TEAM_LEAD")) {
            if (user.getTeam() != null) {
                allTasks = taskRepository.findByTeamId(user.getTeam().getId());
            } else {
                allTasks = new java.util.ArrayList<>();
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

        List<com.store.taskmanager.entity.Checklist> delayedChecklists = checklistRepository.findDelayedChecklists(LocalDateTime.now());
        if (role.equals("MANAGER")) {
            delayedChecklists = delayedChecklists.stream()
                    .filter(c -> c.getTeam() != null && c.getTeam().getManager() != null && c.getTeam().getManager().getId().equals(user.getId()))
                    .collect(Collectors.toList());
        } else if (role.equals("TEAM_LEAD") || role.equals("STAFF") || role.equals("DEVELOPER") || role.equals("TESTER")) {
            if (user.getTeam() != null) {
                delayedChecklists = delayedChecklists.stream()
                        .filter(c -> c.getTeam() != null && c.getTeam().getId().equals(user.getTeam().getId()))
                        .collect(Collectors.toList());
            } else {
                delayedChecklists = new java.util.ArrayList<>();
            }
        }
        dashboard.setDelayedChecklists((long) delayedChecklists.size());

        boolean isLeadOrAbove = role.equals("SUPER_ADMIN") || role.equals("MANAGER") || role.equals("TEAM_LEAD");

        if (isLeadOrAbove) {
            List<com.store.taskmanager.entity.Handover> missedHandovers = handoverRepository.findMissedHandovers();
            if (role.equals("MANAGER")) {
                missedHandovers = missedHandovers.stream()
                        .filter(h -> (h.getAssignedTeam() != null && h.getAssignedTeam().getManager() != null && h.getAssignedTeam().getManager().getId().equals(user.getId())) ||
                                     (h.getReceivingTeam() != null && h.getReceivingTeam().getManager() != null && h.getReceivingTeam().getManager().getId().equals(user.getId())))
                        .collect(Collectors.toList());
            } else if (role.equals("TEAM_LEAD")) {
                if (user.getTeam() != null) {
                    missedHandovers = missedHandovers.stream()
                            .filter(h -> (h.getAssignedTeam() != null && h.getAssignedTeam().getId().equals(user.getTeam().getId())) ||
                                         (h.getReceivingTeam() != null && h.getReceivingTeam().getId().equals(user.getTeam().getId())))
                            .collect(Collectors.toList());
                } else {
                    missedHandovers = new java.util.ArrayList<>();
                }
            }
            dashboard.setMissedHandovers((long) missedHandovers.size());
            dashboard.setPendingApprovals(dashboard.getPendingTasks());
        } else {
            dashboard.setMissedHandovers(0L);
            dashboard.setPendingApprovals(0L);
        }

        // Calculate total projects and teams
        if (role.equals("SUPER_ADMIN")) {
            dashboard.setTotalProjects(projectRepository.count());
            dashboard.setTotalTeams(teamRepository.count());
        } else if (role.equals("MANAGER")) {
            dashboard.setTotalProjects((long) projectRepository.findByTeamsManagerId(user.getId()).size());
            dashboard.setTotalTeams((long) teamRepository.findByManagerId(user.getId()).size());
        } else {
            dashboard.setTotalProjects(user.getTeam() != null && user.getTeam().getProject() != null ? 1L : 0L);
            dashboard.setTotalTeams(user.getTeam() != null ? 1L : 0L);
        }

        List<com.store.taskmanager.entity.Task> recentTasks = allTasks.stream()
                .sorted((a, b) -> b.getUpdatedAt().compareTo(a.getUpdatedAt()))
                .limit(10)
                .collect(Collectors.toList());

        dashboard.setRecentTasks(recentTasks.stream()
                .map(this::mapTaskToDTO)
                .collect(Collectors.toList()));

        if (shiftId != null || role.equals("MANAGER") || role.equals("TEAM_LEAD")) {
            List<com.store.taskmanager.entity.ChecklistItem> pendingItems;
            if (role.equals("MANAGER")) {
                pendingItems = checklistItemRepository.findAll().stream()
                        .filter(i -> !i.isCompleted() && i.getChecklist() != null && i.getChecklist().getTeam() != null && i.getChecklist().getTeam().getManager() != null && i.getChecklist().getTeam().getManager().getId().equals(user.getId()))
                        .collect(Collectors.toList());
            } else if (role.equals("TEAM_LEAD") && user.getTeam() != null) {
                pendingItems = checklistItemRepository.findAll().stream()
                        .filter(i -> !i.isCompleted() && i.getChecklist() != null && i.getChecklist().getTeam() != null && i.getChecklist().getTeam().getId().equals(user.getTeam().getId()))
                        .collect(Collectors.toList());
            } else if (shiftId != null) {
                pendingItems = checklistItemRepository.findPendingItemsByShiftId(shiftId);
            } else {
                pendingItems = new java.util.ArrayList<>();
            }

            dashboard.setPendingChecklistItems(pendingItems.stream()
                    .map(this::mapChecklistItemToDTO)
                    .collect(Collectors.toList()));
            dashboard.setPendingChecklistItemsCount((long) pendingItems.size());
            
            List<com.store.taskmanager.entity.Handover> pendingHandovers;
            if (role.equals("MANAGER")) {
                pendingHandovers = handoverRepository.findMissedHandovers().stream()
                        .filter(h -> (h.getAssignedTeam() != null && h.getAssignedTeam().getManager() != null && h.getAssignedTeam().getManager().getId().equals(user.getId())) ||
                                     (h.getReceivingTeam() != null && h.getReceivingTeam().getManager() != null && h.getReceivingTeam().getManager().getId().equals(user.getId())))
                        .collect(Collectors.toList());
            } else if (role.equals("TEAM_LEAD") && user.getTeam() != null) {
                pendingHandovers = handoverRepository.findMissedHandovers().stream()
                        .filter(h -> (h.getAssignedTeam() != null && h.getAssignedTeam().getId().equals(user.getTeam().getId())) ||
                                     (h.getReceivingTeam() != null && h.getReceivingTeam().getId().equals(user.getTeam().getId())))
                        .collect(Collectors.toList());
            } else if (shiftId != null) {
                pendingHandovers = handoverRepository.findUnresolvedByShiftId(shiftId);
            } else {
                pendingHandovers = new java.util.ArrayList<>();
            }
            
            dashboard.setPendingHandovers(pendingHandovers.stream()
                    .map(this::mapHandoverToDTO)
                    .collect(Collectors.toList()));
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
