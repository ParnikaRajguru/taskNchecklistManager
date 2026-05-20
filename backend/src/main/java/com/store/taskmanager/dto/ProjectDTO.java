package com.store.taskmanager.dto;

import lombok.Data;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ProjectDTO {
    private Long id;
    private String publicId;
    private String name;
    private String description;
    private String status;
    private LocalDate startDate;
    private LocalDate endDate;
    private Integer teamCount;
    private Integer taskCount;
    private LocalDateTime createdAt;
}
