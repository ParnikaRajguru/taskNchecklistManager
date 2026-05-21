package com.store.taskmanager.dto;

import com.store.taskmanager.entity.enums.TaskPriority;
import com.store.taskmanager.entity.enums.TaskStatus;
import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TaskDTO {
    private Long id;
    private String title;
    private String description;
    private TaskStatus status;
    private TaskPriority priority;
    private Long projectId;
    private String projectName;
    private Long teamId;
    private String teamName;
    private Long assignedToId;
    private String assignedToName;
    private Long createdById;
    private String createdByName;
    private LocalDate dueDate;
    private List<NoteDTO> notes;
    private Integer checklistCount;
    private Integer checklistProgress;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
