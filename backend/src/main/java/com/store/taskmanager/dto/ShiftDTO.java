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
    private Long teamId;
    private String teamName;
    private LocalDateTime createdAt;
}
