package com.store.taskmanager.dto;

import com.store.taskmanager.entity.enums.ShiftType;
import lombok.Data;
import java.time.LocalTime;
import java.time.LocalDateTime;

@Data
public class ShiftDTO {
    private Long id;
    private String name;
    private ShiftType shiftType;
    private LocalTime startTime;
    private LocalTime endTime;
    private boolean active;
    private Long projectId;
    private String projectName;
    private Long teamId;
    private String teamName;
    private Integer userCount;
    private Integer checklistCount;
    private Integer taskCount;
    private LocalDateTime createdAt;
}
