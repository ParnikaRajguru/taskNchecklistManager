package com.store.taskmanager.service;

import com.store.taskmanager.dto.*;
import com.store.taskmanager.entity.Project;
import com.store.taskmanager.entity.User;
import com.store.taskmanager.exception.ResourceNotFoundException;
import com.store.taskmanager.repository.ProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {
    
    private final ProjectRepository projectRepository;
    private final AuditLogService auditLogService;
    
    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public ProjectDTO getProjectById(Long id) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        return mapToDTO(project);
    }
    
    public List<ProjectDTO> getProjectsByStatus(String status) {
        return projectRepository.findByStatus(status).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public ProjectDTO createProject(CreateProjectRequest request, User currentUser) {
        Project project = new Project();
        project.setName(request.getName());
        project.setDescription(request.getDescription());
        project.setStatus(request.getStatus() != null ? request.getStatus() : "ACTIVE");
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());
        
        projectRepository.save(project);
        
        auditLogService.log("PROJECT_CREATED", "Project", project.getId(), null, "project created: " + project.getName(), currentUser);
        
        return mapToDTO(project);
    }
    
    @Transactional
    public ProjectDTO updateProject(Long id, CreateProjectRequest request, User currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        
        if (request.getName() != null) project.setName(request.getName());
        if (request.getDescription() != null) project.setDescription(request.getDescription());
        if (request.getStatus() != null) project.setStatus(request.getStatus());
        if (request.getStartDate() != null) project.setStartDate(request.getStartDate());
        if (request.getEndDate() != null) project.setEndDate(request.getEndDate());
        
        projectRepository.save(project);
        
        auditLogService.log("PROJECT_UPDATED", "Project", id, null, "project updated: " + project.getName(), currentUser);
        
        return mapToDTO(project);
    }
    
    @Transactional
    public void deleteProject(Long id, User currentUser) {
        Project project = projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found with id: " + id));
        
        auditLogService.log("PROJECT_DELETED", "Project", id, null, "project deleted: " + project.getName(), currentUser);
        
        projectRepository.delete(project);
    }
    
    private ProjectDTO mapToDTO(Project project) {
        ProjectDTO dto = new ProjectDTO();
        dto.setId(project.getId());
        dto.setName(project.getName());
        dto.setDescription(project.getDescription());
        dto.setStatus(project.getStatus());
        dto.setStartDate(project.getStartDate());
        dto.setEndDate(project.getEndDate());
        dto.setCreatedAt(project.getCreatedAt());
        
        if (project.getTeams() != null) {
            dto.setTeamCount(project.getTeams().size());
        }
        if (project.getTasks() != null) {
            dto.setTaskCount(project.getTasks().size());
        }
        if (project.getShifts() != null) {
            dto.setShiftCount(project.getShifts().size());
        }
        if (project.getChecklists() != null) {
            dto.setChecklistCount(project.getChecklists().size());
        }
        if (project.getHandovers() != null) {
            dto.setHandoverCount(project.getHandovers().size());
        }
        
        return dto;
    }
}