package com.store.taskmanager.service;

import com.store.taskmanager.dto.*;
import com.store.taskmanager.entity.Team;
import com.store.taskmanager.entity.Project;
import com.store.taskmanager.entity.User;
import com.store.taskmanager.exception.ResourceNotFoundException;
import com.store.taskmanager.repository.TeamRepository;
import com.store.taskmanager.repository.ProjectRepository;
import com.store.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {
    
    private final TeamRepository teamRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    
    public List<TeamDTO> getAllTeams() {
        return teamRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public TeamDTO getTeamById(Long id) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));
        return mapToDTO(team);
    }
    
    public List<TeamDTO> getTeamsByProject(Long projectId) {
        return teamRepository.findByProjectId(projectId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public TeamDTO createTeam(CreateTeamRequest request, User currentUser) {
        Team team = new Team();
        team.setName(request.getName());
        team.setDescription(request.getDescription());
        
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
            team.setProject(project);
        }
        
        if (request.getTeamLeadId() != null) {
            User teamLead = userRepository.findById(request.getTeamLeadId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            team.setTeamLead(teamLead);
        }
        
        teamRepository.save(team);
        
        auditLogService.log("TEAM_CREATED", "Team", team.getId(), null, "team created: " + team.getName(), currentUser);
        
        return mapToDTO(team);
    }
    
    @Transactional
    public TeamDTO updateTeam(Long id, CreateTeamRequest request, User currentUser) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));
        
        if (request.getName() != null) team.setName(request.getName());
        if (request.getDescription() != null) team.setDescription(request.getDescription());
        
        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
            team.setProject(project);
        }
        
        if (request.getTeamLeadId() != null) {
            User teamLead = userRepository.findById(request.getTeamLeadId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
            team.setTeamLead(teamLead);
        }
        
        teamRepository.save(team);
        
        auditLogService.log("TEAM_UPDATED", "Team", id, null, "team updated: " + team.getName(), currentUser);
        
        return mapToDTO(team);
    }
    
    @Transactional
    public void deleteTeam(Long id, User currentUser) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));
        
        auditLogService.log("TEAM_DELETED", "Team", id, null, "team deleted: " + team.getName(), currentUser);
        
        teamRepository.delete(team);
    }
    
    private TeamDTO mapToDTO(Team team) {
        TeamDTO dto = new TeamDTO();
        dto.setId(team.getId());
        dto.setName(team.getName());
        dto.setDescription(team.getDescription());
        dto.setCreatedAt(team.getCreatedAt());
        
        if (team.getProject() != null) {
            dto.setProjectId(team.getProject().getId());
            dto.setProjectName(team.getProject().getName());
        }
        
        if (team.getTeamLead() != null) {
            dto.setTeamLeadId(team.getTeamLead().getId());
            dto.setTeamLeadName(team.getTeamLead().getFullName());
        }
        
        if (team.getMembers() != null) {
            dto.setMemberCount(team.getMembers().size());
        }
        
        return dto;
    }
}