package com.store.taskmanager.dto;

import com.store.taskmanager.entity.enums.Role;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class HandoverNoteDTO {
    private Long id;
    private String content;
    private Long handoverId;
    private Long createdById;
    private String createdByName;
    private Role createdByRole;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}