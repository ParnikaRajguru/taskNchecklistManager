package com.store.taskmanager.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class AuditLogDTO {
    private Long id;
    private String action;
    private String entityType;
    private Long entityId;
    private String oldValue;
    private String newValue;
    private Long performedById;
    private String performedByName;
    private LocalDateTime timestamp;
}