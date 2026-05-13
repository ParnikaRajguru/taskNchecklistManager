package com.store.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class CreateProjectRequest {
    @NotBlank(message = "Project name is required")
    private String name;
    
    private String description;
    private String status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
}