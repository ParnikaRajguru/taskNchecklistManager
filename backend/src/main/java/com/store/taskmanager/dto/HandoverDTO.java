package com.store.taskmanager.dto;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class HandoverDTO {
    private Long id;
    private String title;
    private String completedWork;
    private String pendingWork;
    private String blockers;
    private String nextShiftInstructions;
    private Long fromShiftId;
    private String fromShiftName;
    private Long toShiftId;
    private String toShiftName;
    private Long createdById;
    private String createdByName;
    private boolean resolved;
    private List<NoteDTO> notes;
    private LocalDateTime createdAt;
}