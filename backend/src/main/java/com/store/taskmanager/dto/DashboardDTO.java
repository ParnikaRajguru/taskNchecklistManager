package com.store.taskmanager.dto;

import lombok.Data;
import java.util.List;

@Data
public class DashboardDTO {
    private Long totalTasks;
    private Long pendingTasks;
    private Long completedTasks;
    private Long overdueTasks;
    private Long blockedTasks;
    private List<TaskDTO> recentTasks;
    private List<HandoverDTO> pendingHandovers;
    private List<ChecklistItemDTO> pendingChecklistItems;
}