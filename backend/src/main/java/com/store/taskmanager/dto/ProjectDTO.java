package com.store.taskmanager.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ProjectDTO {
    private Long id;
    private String name;
    private String description;
    private String status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer teamCount;
    private LocalDateTime createdAt;
}