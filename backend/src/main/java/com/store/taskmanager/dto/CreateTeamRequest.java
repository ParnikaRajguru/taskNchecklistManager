package com.store.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class CreateTeamRequest {
    @NotBlank(message = "Team name is required")
    private String name;

    private String description;
    private Long projectId;
    private Long managerId;
    private Long teamLeadId;
    private List<Long> memberIds;
}
