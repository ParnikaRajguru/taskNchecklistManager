package com.store.taskmanager.service;

import com.store.taskmanager.dto.*;
import com.store.taskmanager.entity.Team;
import com.store.taskmanager.entity.Project;
import com.store.taskmanager.entity.User;
import com.store.taskmanager.exception.BadRequestException;
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
        validateTeamAssignment(request);

        Team team = new Team();
        team.setName(request.getName());
        team.setDescription(request.getDescription());

        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
            team.setProject(project);
        }

        if (request.getManagerId() != null) {
            User manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
            team.setManager(manager);
        }

        if (request.getTeamLeadId() != null) {
            User teamLead = userRepository.findById(request.getTeamLeadId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team Lead not found"));
            team.setTeamLead(teamLead);
        }

        teamRepository.save(team);

        assignMembers(team, request.getMemberIds());

        auditLogService.log("TEAM_CREATED", "Team", team.getId(), null, "team created: " + team.getName(), currentUser);

        return mapToDTO(team);
    }

    @Transactional
    public TeamDTO updateTeam(Long id, CreateTeamRequest request, User currentUser) {
        validateTeamAssignment(request);

        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));

        if (request.getName() != null) team.setName(request.getName());
        if (request.getDescription() != null) team.setDescription(request.getDescription());

        if (request.getProjectId() != null) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
            team.setProject(project);
        }

        if (request.getManagerId() != null) {
            User manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
            team.setManager(manager);
        } else {
            team.setManager(null);
        }

        if (request.getTeamLeadId() != null) {
            User teamLead = userRepository.findById(request.getTeamLeadId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team Lead not found"));
            team.setTeamLead(teamLead);
        } else {
            team.setTeamLead(null);
        }

        teamRepository.save(team);

        assignMembers(team, request.getMemberIds());

        auditLogService.log("TEAM_UPDATED", "Team", id, null, "team updated: " + team.getName(), currentUser);

        return mapToDTO(team);
    }

    private void validateTeamAssignment(CreateTeamRequest request) {
        if (request.getManagerId() != null && request.getTeamLeadId() != null
                && request.getManagerId().equals(request.getTeamLeadId())) {
            throw new BadRequestException("Same person cannot be both manager and team lead");
        }
        if (request.getManagerId() != null && request.getMemberIds() != null
                && request.getMemberIds().contains(request.getManagerId())) {
            throw new BadRequestException("Manager should not be added as a team member");
        }
        if (request.getTeamLeadId() != null && request.getMemberIds() != null
                && request.getMemberIds().contains(request.getTeamLeadId())) {
            throw new BadRequestException("Team Lead should not be added as a team member");
        }
    }

    private void assignMembers(Team team, List<Long> memberIds) {
        if (memberIds == null) return;

        for (User existingMember : userRepository.findByTeamId(team.getId())) {
            if (!memberIds.contains(existingMember.getId())) {
                existingMember.setTeam(null);
                userRepository.save(existingMember);
            }
        }

        for (Long memberId : memberIds) {
            User member = userRepository.findById(memberId)
                    .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + memberId));
            member.setTeam(team);
            userRepository.save(member);
        }
    }

    @Transactional
    public void deleteTeam(Long id, User currentUser) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));

        for (User member : userRepository.findByTeamId(id)) {
            member.setTeam(null);
            userRepository.save(member);
        }

        team.setManager(null);
        team.setTeamLead(null);

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

        if (team.getManager() != null) {
            dto.setManagerId(team.getManager().getId());
            dto.setManagerName(team.getManager().getFullName());
        }

        if (team.getTeamLead() != null) {
            dto.setTeamLeadId(team.getTeamLead().getId());
            dto.setTeamLeadName(team.getTeamLead().getFullName());
        }

        if (team.getMembers() != null) {
            List<User> members = team.getMembers();
            dto.setMemberCount(members.size());
            dto.setMemberIds(members.stream().map(User::getId).collect(Collectors.toList()));
            dto.setMemberNames(members.stream().map(User::getFullName).collect(Collectors.toList()));
            dto.setMemberRoles(members.stream().map(m -> m.getRole().name()).collect(Collectors.toList()));
        }
        if (team.getTasks() != null) {
            dto.setTaskCount(team.getTasks().size());
        }

        return dto;
    }
}
