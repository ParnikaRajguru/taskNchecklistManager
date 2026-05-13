package com.store.taskmanager.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TeamDTO {
    private Long id;
    private String name;
    private String description;
    private Long projectId;
    private String projectName;
    private Long teamLeadId;
    private String teamLeadName;
    private Integer memberCount;
    private LocalDateTime createdAt;
}