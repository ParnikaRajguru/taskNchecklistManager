package com.store.taskmanager.dto;

import com.store.taskmanager.entity.enums.TaskPriority;
import com.store.taskmanager.entity.enums.TaskStatus;
import lombok.Data;
import java.time.LocalDate;

@Data
public class UpdateTaskRequest {
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private Long projectId;
    private Long teamId;
    private Long assignedToId;
    private LocalDate dueDate;
}
