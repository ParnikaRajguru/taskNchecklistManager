package com.store.taskmanager.dto;

import com.store.taskmanager.entity.enums.TaskPriority;
import com.store.taskmanager.entity.enums.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDate;

@Data
public class CreateTaskRequest {
    @NotBlank(message = "Task title is required")
    private String title;

    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private Long projectId;
    private Long teamId;
    private Long assignedToId;
    private LocalDate dueDate;
}
