package com.store.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateNoteRequest {
    @NotBlank(message = "Content is required")
    private String content;
    
    private Long taskId;
    private Long checklistItemId;
    private Long handoverId;
}