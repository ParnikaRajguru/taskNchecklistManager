package com.store.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateHandoverRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String completedWork;
    private String pendingWork;
    private String blockers;
    private String nextShiftInstructions;
    private Long projectId;
    private Long fromShiftId;
    private Long toShiftId;
    private Long assignedTeamId;
    private Long receivingTeamId;
    private String priority;
}
