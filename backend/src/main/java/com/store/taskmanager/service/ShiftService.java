package com.store.taskmanager.service;

import com.store.taskmanager.dto.*;
import com.store.taskmanager.entity.Shift;
import com.store.taskmanager.entity.Project;
import com.store.taskmanager.entity.Team;
import com.store.taskmanager.entity.User;
import com.store.taskmanager.exception.ResourceNotFoundException;
import com.store.taskmanager.repository.ShiftRepository;
import com.store.taskmanager.repository.ProjectRepository;
import com.store.taskmanager.repository.TeamRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ShiftService {
    
    private final ShiftRepository shiftRepository;
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final AuditLogService auditLogService;
    
    public List<ShiftDTO> getAllShifts() {
        return shiftRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public ShiftDTO getShiftById(Long id) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shift not found with id: " + id));
        return mapToDTO(shift);
    }
    
    public List<ShiftDTO> getActiveShifts() {
        return shiftRepository.findByActiveTrue().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public ShiftDTO createShift(CreateShiftRequest request, User currentUser) {
        Shift shift = new Shift();
        shift.setName(request.getName());
        shift.setShiftType(request.getShiftType());
        shift.setStartTime(request.getStartTime());
        shift.setEndTime(request.getEndTime());
        shift.setActive(request.getActive() != null ? request.getActive() : true);

        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
            shift.setProject(project);
        }

        if (request.getTeamId() != null) {
            Team team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
            shift.setTeam(team);
        }
        
        shiftRepository.save(shift);
        
        auditLogService.log("SHIFT_CREATED", "Shift", shift.getId(), null, "shift created: " + shift.getName(), currentUser);
        
        return mapToDTO(shift);
    }
    
    @Transactional
    public ShiftDTO updateShift(Long id, CreateShiftRequest request, User currentUser) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shift not found with id: " + id));
        
        if (request.getName() != null) shift.setName(request.getName());
        if (request.getShiftType() != null) shift.setShiftType(request.getShiftType());
        if (request.getStartTime() != null) shift.setStartTime(request.getStartTime());
        if (request.getEndTime() != null) shift.setEndTime(request.getEndTime());
        if (request.getActive() != null) shift.setActive(request.getActive());

        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
            shift.setProject(project);
        }

        if (request.getTeamId() != null) {
            Team team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
            shift.setTeam(team);
        }
        
        shiftRepository.save(shift);
        
        auditLogService.log("SHIFT_UPDATED", "Shift", id, null, "shift updated: " + shift.getName(), currentUser);
        
        return mapToDTO(shift);
    }
    
    @Transactional
    public void deleteShift(Long id, User currentUser) {
        Shift shift = shiftRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Shift not found with id: " + id));
        
        auditLogService.log("SHIFT_DELETED", "Shift", id, null, "shift deleted: " + shift.getName(), currentUser);
        
        shiftRepository.delete(shift);
    }
    
    private ShiftDTO mapToDTO(Shift shift) {
        ShiftDTO dto = new ShiftDTO();
        dto.setId(shift.getId());
        dto.setName(shift.getName());
        dto.setShiftType(shift.getShiftType());
        dto.setStartTime(shift.getStartTime());
        dto.setEndTime(shift.getEndTime());
        dto.setActive(shift.isActive());
        dto.setCreatedAt(shift.getCreatedAt());

        if (shift.getProject() != null) {
            dto.setProjectId(shift.getProject().getId());
            dto.setProjectName(shift.getProject().getName());
        }

        if (shift.getTeam() != null) {
            dto.setTeamId(shift.getTeam().getId());
            dto.setTeamName(shift.getTeam().getName());
        }
        
        if (shift.getUsers() != null) {
            dto.setUserCount(shift.getUsers().size());
        }

        if (shift.getChecklists() != null) {
            dto.setChecklistCount(shift.getChecklists().size());
        }

        if (shift.getTasks() != null) {
            dto.setTaskCount(shift.getTasks().size());
        }
        
        return dto;
    }
}
