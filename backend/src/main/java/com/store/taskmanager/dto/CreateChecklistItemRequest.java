package com.store.taskmanager.dto;

import lombok.Data;

@Data
public class CreateChecklistItemRequest {
    private String title;
    private String description;
    private Long assignedToId;
    private Long taskId;
}