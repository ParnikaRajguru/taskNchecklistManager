package com.store.taskmanager.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class ChecklistDTO {
    private Long id;
    private String title;
    private String description;
    private Long shiftId;
    private String shiftName;
    private Long teamId;
    private String teamName;
    private Long taskId;
    private String taskTitle;
    private Long createdById;
    private String createdByName;
    private List<ChecklistItemDTO> items;
    private Integer progressPercentage;
    private LocalDateTime createdAt;
}
