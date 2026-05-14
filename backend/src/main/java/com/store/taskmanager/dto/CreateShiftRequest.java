package com.store.taskmanager.dto;

import com.store.taskmanager.entity.enums.ShiftType;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.time.LocalTime;

@Data
public class CreateShiftRequest {
    @NotBlank(message = "Shift name is required")
    private String name;

    private ShiftType shiftType;
    private LocalTime startTime;
    private LocalTime endTime;
    private Boolean active;
    private Long teamId;
}
