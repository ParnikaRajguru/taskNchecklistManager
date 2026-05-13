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
    private Long teamManagerId;
    private String teamManagerName;
    private Long teamLeadId;
    private String teamLeadName;
    private List<Long> memberIds;
    private List<String> memberNames;
    private List<String> memberRoles;
    private Integer memberCount;
    private Integer taskCount;
    private Integer shiftCount;
    private Integer checklistCount;
    private LocalDateTime createdAt;
}
