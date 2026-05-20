package com.store.taskmanager.service;

import com.store.taskmanager.dto.*;
import com.store.taskmanager.entity.*;
import com.store.taskmanager.exception.BadRequestException;
import com.store.taskmanager.exception.ResourceNotFoundException;
import com.store.taskmanager.repository.TeamRepository;
import com.store.taskmanager.repository.ProjectRepository;
import com.store.taskmanager.repository.UserRepository;
import com.store.taskmanager.repository.TaskRepository;
import com.store.taskmanager.repository.ShiftRepository;
import com.store.taskmanager.repository.ChecklistRepository;
import com.store.taskmanager.repository.HandoverRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final ProjectRepository projectRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final ShiftRepository shiftRepository;
    private final ChecklistRepository checklistRepository;
    private final HandoverRepository handoverRepository;
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

    public List<TeamDTO> getTeamsByManager(Long managerId) {
        return teamRepository.findByManagerId(managerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TeamDTO createTeam(CreateTeamRequest request, User currentUser) {
        validateTeamAssignment(request, null);

        Team existingTeamWithProject = projectRepository.findById(request.getProjectId())
                .flatMap(project -> teamRepository.findByProjectId(project.getId()).stream().findFirst())
                .orElse(null);
        if (existingTeamWithProject != null) {
            throw new BadRequestException("Project already has team: " + existingTeamWithProject.getName());
        }

        Team team = new Team();
        team.setName(request.getName());
        team.setDescription(request.getDescription());
        team.setPublicId(generateNextTeamPublicId());

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
        teamRepository.flush();

        if (request.getManagerId() != null) {
            // Manager manages team via team.manager, so we don't necessarily need to set user.team
            // But we can update if needed. Let's just leave it out to not overwrite primary team
        }

        if (request.getTeamLeadId() != null) {
            User teamLead = userRepository.findById(request.getTeamLeadId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team Lead not found"));
            teamLead.setTeam(team);
            userRepository.save(teamLead);
            userRepository.flush();
        }

        assignMembers(team, request.getMemberIds());
        userRepository.flush();

        auditLogService.log("TEAM_CREATED", "Team", team.getId(), null, "team created: " + team.getName(), currentUser);

        return mapToDTO(team);
    }

    @Transactional
    public TeamDTO updateTeam(Long id, CreateTeamRequest request, User currentUser) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));

        Long oldManagerId = team.getManager() != null ? team.getManager().getId() : null;
        Long oldTeamLeadId = team.getTeamLead() != null ? team.getTeamLead().getId() : null;
        List<Long> oldMemberIds = userRepository.findByTeamId(id).stream().map(User::getId).collect(Collectors.toList());

        team.setName(request.getName());
        team.setDescription(request.getDescription());

        if (request.getProjectId() != null && request.getProjectId() > 0) {
            Project project = projectRepository.findById(request.getProjectId())
                    .orElseThrow(() -> new ResourceNotFoundException("Project not found"));
            team.setProject(project);
        } else {
            team.setProject(null);
        }

        if (request.getManagerId() != null && request.getManagerId() > 0) {
            User manager = userRepository.findById(request.getManagerId())
                    .orElseThrow(() -> new ResourceNotFoundException("Manager not found"));
            team.setManager(manager);
        } else {
            team.setManager(null);
        }

        if (request.getTeamLeadId() != null && request.getTeamLeadId() > 0) {
            User teamLead = userRepository.findById(request.getTeamLeadId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team Lead not found"));
            team.setTeamLead(teamLead);
            teamLead.setTeam(team);
            userRepository.save(teamLead);
        } else {
            if (team.getTeamLead() != null) {
                User oldTeamLead = team.getTeamLead();
                oldTeamLead.setTeam(null);
                userRepository.save(oldTeamLead);
            }
            team.setTeamLead(null);
        }

        teamRepository.save(team);
        teamRepository.flush();

        if (oldManagerId != null && !oldManagerId.equals(request.getManagerId())) {
            // No need to clear old manager's team field because manager can manage multiple
        }

        if (oldTeamLeadId != null && !oldTeamLeadId.equals(request.getTeamLeadId())) {
            User oldTeamLead = userRepository.findById(oldTeamLeadId).orElse(null);
            if (oldTeamLead != null && oldTeamLead.getTeam() != null && oldTeamLead.getTeam().getId().equals(id)) {
                oldTeamLead.setTeam(null);
                userRepository.save(oldTeamLead);
            }
        }

        for (Long memberId : oldMemberIds) {
            if (request.getMemberIds() == null || !request.getMemberIds().contains(memberId)) {
                User member = userRepository.findById(memberId).orElse(null);
                if (member != null && member.getTeam() != null && member.getTeam().getId().equals(id)) {
                    member.setTeam(null);
                    userRepository.save(member);
                }
            }
        }

        if (request.getMemberIds() != null) {
            for (Long memberId : request.getMemberIds()) {
                User member = userRepository.findById(memberId)
                        .orElseThrow(() -> new ResourceNotFoundException("Member not found"));
                member.setTeam(team);
                userRepository.save(member);
            }
        }

        userRepository.flush();

        auditLogService.log("TEAM_UPDATED", "Team", id, null, "team updated: " + team.getName(), currentUser);

        return mapToDTO(team);
    }

    private void validateTeamAssignment(CreateTeamRequest request, Long currentTeamId) {
        if (request.getManagerId() != null && request.getTeamLeadId() != null
                && request.getManagerId().equals(request.getTeamLeadId())) {
            throw new BadRequestException("Same person cannot be both manager and team lead");
        }
        if (request.getManagerId() != null && request.getMemberIds() != null
                && request.getMemberIds().contains(request.getManagerId())) {
            throw new BadRequestException("Manager should not be added as a team member");
        }
        if (request.getTeamLeadId() != null && request.getMemberIds() != null
                && request.getTeamLeadId().equals(request.getTeamLeadId())) {
            throw new BadRequestException("Team Lead should not be added as a team member");
        }

        if (request.getManagerId() != null) {
            List<Team> existingTeams = teamRepository.findByManagerIdAndIdNot(request.getManagerId(), currentTeamId != null ? currentTeamId : -1L);
            if (existingTeams.size() >= 3) {
                throw new BadRequestException("Manager is already assigned to the maximum of 3 teams.");
            }
        }

        if (request.getTeamLeadId() != null) {
            Optional<Team> existingTeam = teamRepository.findByTeamLeadIdAndIdNot(request.getTeamLeadId(), currentTeamId != null ? currentTeamId : -1);
            if (existingTeam.isPresent()) {
                throw new BadRequestException("Team Lead is already assigned to team: " + existingTeam.get().getName());
            }
        }

        if (request.getMemberIds() != null) {
            for (Long memberId : request.getMemberIds()) {
                User member = userRepository.findById(memberId).orElse(null);
                if (member != null && member.getTeam() != null && !member.getTeam().getId().equals(currentTeamId)) {
                    throw new BadRequestException("User " + member.getFullName() + " is already in team: " + member.getTeam().getName());
                }
            }
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
        userRepository.flush();

        for (Long memberId : memberIds) {
            User member = userRepository.findById(memberId)
                    .orElseThrow(() -> new ResourceNotFoundException("Member not found with id: " + memberId));
            member.setTeam(team);
            userRepository.save(member);
        }
        userRepository.flush();
    }

    @Transactional
    public void deleteTeam(Long id, User currentUser) {
        Team team = teamRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Team not found with id: " + id));

        for (User member : userRepository.findByTeamId(id)) {
            member.setTeam(null);
            userRepository.save(member);
        }

        for (Task task : taskRepository.findByTeamId(id)) {
            task.setTeam(null);
            taskRepository.save(task);
        }

        for (Shift shift : shiftRepository.findByTeamId(id)) {
            shift.setTeam(null);
            shiftRepository.save(shift);
        }

        for (Checklist checklist : checklistRepository.findByTeamId(id)) {
            checklist.setTeam(null);
            checklistRepository.save(checklist);
        }

        for (Handover handover : handoverRepository.findByAssignedTeamId(id)) {
            handover.setAssignedTeam(null);
            handoverRepository.save(handover);
        }
        for (Handover handover : handoverRepository.findByReceivingTeamId(id)) {
            handover.setReceivingTeam(null);
            handoverRepository.save(handover);
        }

        team.setManager(null);
        team.setTeamLead(null);
        team.setProject(null);

        auditLogService.log("TEAM_DELETED", "Team", id, null, "team deleted: " + team.getName(), currentUser);

        teamRepository.delete(team);
    }

    private TeamDTO mapToDTO(Team team) {
        TeamDTO dto = new TeamDTO();
        dto.setId(team.getId());
        dto.setPublicId(team.getPublicId());
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

    private String generateNextTeamPublicId() {
        long count = teamRepository.count();
        String publicId;
        int counter = 1;
        do {
            publicId = String.format("TEAM-%03d", count + counter);
            counter++;
        } while (teamRepository.findByPublicId(publicId).isPresent());
        return publicId;
    }

    @Transactional
    public String syncUserTeamRelationships() {
        int syncedCount = 0;
        List<Team> allTeams = teamRepository.findAll();

        for (Team team : allTeams) {
            if (team.getTeamLead() != null) {
                User teamLead = team.getTeamLead();
                if (teamLead.getTeam() == null || !teamLead.getTeam().getId().equals(team.getId())) {
                    teamLead.setTeam(team);
                    userRepository.save(teamLead);
                    syncedCount++;
                }
            }

            for (User member : team.getMembers()) {
                if (member.getTeam() == null || !member.getTeam().getId().equals(team.getId())) {
                    member.setTeam(team);
                    userRepository.save(member);
                    syncedCount++;
                }
            }
        }

        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            if (user.getTeam() != null) {
                Team team = user.getTeam();
                boolean isTeamLead = team.getTeamLead() != null && team.getTeamLead().getId().equals(user.getId());
                boolean isMember = team.getMembers().stream().anyMatch(m -> m.getId().equals(user.getId()));

                if (!isTeamLead && !isMember) {
                    user.setTeam(null);
                    userRepository.save(user);
                    syncedCount++;
                }
            }
        }

        userRepository.flush();
        return "Synced " + syncedCount + " user-team relationships";
    }
}
