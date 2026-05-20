package com.store.taskmanager.service;

import com.store.taskmanager.dto.*;
import com.store.taskmanager.entity.Handover;
import com.store.taskmanager.entity.HandoverNote;
import com.store.taskmanager.entity.Project;
import com.store.taskmanager.entity.Shift;
import com.store.taskmanager.entity.Team;
import com.store.taskmanager.entity.User;
import com.store.taskmanager.entity.enums.HandoverPriority;
import com.store.taskmanager.exception.ResourceNotFoundException;
import com.store.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HandoverService {

    private final HandoverRepository handoverRepository;
    private final ProjectRepository projectRepository;
    private final ShiftRepository shiftRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public List<HandoverDTO> getAllHandovers() {
        return handoverRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<HandoverDTO> getHandoversByManager(Long managerId) {
        return handoverRepository.findByManagerId(managerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public HandoverDTO getHandoverById(Long id) {
        Handover handover = handoverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Handover not found with id: " + id));
        return mapToDTO(handover);
    }

    public List<HandoverDTO> getHandoversByShift(Long shiftId) {
        return handoverRepository.findByFromShiftId(shiftId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<HandoverDTO> getUnresolvedHandovers(Long shiftId) {
        return handoverRepository.findUnresolvedByShiftId(shiftId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<HandoverDTO> getHandoversByAssignedTeam(Long teamId) {
        return handoverRepository.findByAssignedTeamId(teamId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<HandoverDTO> getUnacknowledgedHandovers(Long teamId) {
        return handoverRepository.findUnacknowledgedByTeamId(teamId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public HandoverDTO createHandover(CreateHandoverRequest request, User currentUser) {
        Handover handover = new Handover();
        handover.setTitle(request.getTitle());
        handover.setCompletedWork(request.getCompletedWork());
        handover.setPendingWork(request.getPendingWork());
        handover.setBlockers(request.getBlockers());
        handover.setNextShiftInstructions(request.getNextShiftInstructions());
        handover.setCreatedBy(currentUser);

        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
            handover.setProject(project);
        }

        if (request.getFromShiftId() != null) {
            Shift fromShift = shiftRepository.findById(request.getFromShiftId())
                    .orElseThrow(() -> new ResourceNotFoundException("Shift not found"));
            handover.setFromShift(fromShift);
        }

        if (request.getToShiftId() != null) {
            Shift toShift = shiftRepository.findById(request.getToShiftId())
                    .orElseThrow(() -> new ResourceNotFoundException("Shift not found"));
            handover.setToShift(toShift);
        }

        if (request.getAssignedTeamId() != null) {
            Team assignedTeam = teamRepository.findById(request.getAssignedTeamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Assigned team not found"));
            handover.setAssignedTeam(assignedTeam);
        }

        if (request.getReceivingTeamId() != null) {
            Team receivingTeam = teamRepository.findById(request.getReceivingTeamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Receiving team not found"));
            handover.setReceivingTeam(receivingTeam);
        }

        if (request.getPriority() != null) {
            handover.setPriority(HandoverPriority.valueOf(request.getPriority()));
        }

        handoverRepository.save(handover);

        auditLogService.log("HANDOVER_CREATED", "Handover", handover.getId(), null, "handover created: " + handover.getTitle(), currentUser);

        return mapToDTO(handover);
    }

    @Transactional
    public HandoverDTO resolveHandover(Long id, User currentUser) {
        Handover handover = handoverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Handover not found with id: " + id));

        handover.setResolved(true);
        handoverRepository.save(handover);

        auditLogService.log("HANDOVER_RESOLVED", "Handover", id, null, "handover resolved", currentUser);

        return mapToDTO(handover);
    }

    @Transactional
    public HandoverDTO acknowledgeHandover(Long id, User currentUser) {
        Handover handover = handoverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Handover not found with id: " + id));

        handover.setAcknowledged(true);
        handover.setAcknowledgedAt(LocalDateTime.now());
        handoverRepository.save(handover);

        auditLogService.log("HANDOVER_ACKNOWLEDGED", "Handover", id, null, "handover acknowledged", currentUser);

        return mapToDTO(handover);
    }

    @Transactional
    public void deleteHandover(Long id, User currentUser) {
        Handover handover = handoverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Handover not found with id: " + id));

        auditLogService.log("HANDOVER_DELETED", "Handover", id, null, "handover deleted: " + handover.getTitle(), currentUser);

        handoverRepository.delete(handover);
    }

    private HandoverDTO mapToDTO(Handover handover) {
        HandoverDTO dto = new HandoverDTO();
        dto.setId(handover.getId());
        dto.setTitle(handover.getTitle());
        dto.setCompletedWork(handover.getCompletedWork());
        dto.setPendingWork(handover.getPendingWork());
        dto.setBlockers(handover.getBlockers());
        dto.setNextShiftInstructions(handover.getNextShiftInstructions());
        dto.setResolved(handover.isResolved());
        dto.setAcknowledged(handover.isAcknowledged());
        dto.setAcknowledgedAt(handover.getAcknowledgedAt());
        dto.setCreatedAt(handover.getCreatedAt());

        if (handover.getPriority() != null) {
            dto.setPriority(handover.getPriority().name());
        }

        if (handover.getProject() != null) {
            dto.setProjectId(handover.getProject().getId());
            dto.setProjectName(handover.getProject().getName());
        }

        if (handover.getFromShift() != null) {
            dto.setFromShiftId(handover.getFromShift().getId());
            dto.setFromShiftName(handover.getFromShift().getName());
        }

        if (handover.getToShift() != null) {
            dto.setToShiftId(handover.getToShift().getId());
            dto.setToShiftName(handover.getToShift().getName());
        }

        if (handover.getAssignedTeam() != null) {
            dto.setAssignedTeamId(handover.getAssignedTeam().getId());
            dto.setAssignedTeamName(handover.getAssignedTeam().getName());
        }

        if (handover.getReceivingTeam() != null) {
            dto.setReceivingTeamId(handover.getReceivingTeam().getId());
            dto.setReceivingTeamName(handover.getReceivingTeam().getName());
        }

        if (handover.getCreatedBy() != null) {
            dto.setCreatedById(handover.getCreatedBy().getId());
            dto.setCreatedByName(handover.getCreatedBy().getFullName());
        }

        if (handover.getNotes() != null) {
            dto.setNotes(handover.getNotes().stream()
                    .map(this::mapHandoverNoteToDTO)
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    private HandoverNoteDTO mapHandoverNoteToDTO(HandoverNote note) {
        HandoverNoteDTO dto = new HandoverNoteDTO();
        dto.setId(note.getId());
        dto.setContent(note.getContent());
        dto.setCreatedAt(note.getCreatedAt());
        dto.setUpdatedAt(note.getUpdatedAt());

        if (note.getCreatedBy() != null) {
            dto.setCreatedById(note.getCreatedBy().getId());
            dto.setCreatedByName(note.getCreatedBy().getFirstName() + " " + note.getCreatedBy().getLastName());
            dto.setCreatedByRole(note.getCreatedBy().getRole());
        }

        if (note.getHandover() != null) {
            dto.setHandoverId(note.getHandover().getId());
        }

        return dto;
    }
}
