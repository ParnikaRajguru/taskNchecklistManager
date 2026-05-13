package com.store.taskmanager.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ChecklistItemDTO {
    private Long id;
    private String title;
    private String description;
    private boolean completed;
    private Long checklistId;
    private Long assignedToId;
    private String assignedToName;
    private Long taskId;
    private String taskTitle;
    private Long completedById;
    private String completedByName;
    private LocalDateTime completedAt;
    private LocalDateTime createdAt;
}