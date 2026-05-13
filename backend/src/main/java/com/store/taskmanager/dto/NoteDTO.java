package com.store.taskmanager.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NoteDTO {
    private Long id;
    private String content;
    private Long createdById;
    private String createdByName;
    private Long taskId;
    private Long checklistItemId;
    private Long handoverId;
    private LocalDateTime createdAt;
}