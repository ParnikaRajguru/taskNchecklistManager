package com.store.taskmanager.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class TeamDTO {
    private Long id;
    private String publicId;
    private String name;
    private String description;
    private Long projectId;
    private String projectName;
    private Long managerId;
    private String managerName;
    private Long teamLeadId;
    private String teamLeadName;
    private List<Long> memberIds;
    private List<String> memberNames;
    private List<String> memberRoles;
    private Integer memberCount;
    private Integer taskCount;
    private LocalDateTime createdAt;
}
