package com.store.taskmanager.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class CreateChecklistRequest {
    @NotBlank(message = "Checklist title is required")
    private String title;

    private String description;
    private Long shiftId;
    private Long teamId;
    private Long taskId;
    private List<CreateChecklistItemRequest> items;
}
