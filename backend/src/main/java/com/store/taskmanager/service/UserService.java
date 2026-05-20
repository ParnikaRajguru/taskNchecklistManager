package com.store.taskmanager.service;

import com.store.taskmanager.dto.*;
import com.store.taskmanager.entity.User;
import com.store.taskmanager.entity.Team;
import com.store.taskmanager.entity.Shift;
import com.store.taskmanager.exception.BadRequestException;
import com.store.taskmanager.exception.ResourceNotFoundException;
import com.store.taskmanager.repository.UserRepository;
import com.store.taskmanager.repository.TeamRepository;
import com.store.taskmanager.repository.ShiftRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final ShiftRepository shiftRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditLogService auditLogService;

    public List<UserDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public UserDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToDTO(user);
    }

    public UserDTO getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return mapToDTO(user);
    }

    public List<UserDTO> getUsersByTeam(Long teamId) {
        return userRepository.findByTeamId(teamId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getUsersByRole(String role) {
        return userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals(role))
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getUsersByManager(Long managerId) {
        return userRepository.findByTeamManagerId(managerId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<UserDTO> getUsersByTeamLead(Long teamLeadId) {
        return userRepository.findByTeamTeamLeadId(teamLeadId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public UserDTO updateUser(Long id, UpdateUserRequest request, User currentUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());

        boolean roleChanged = false;
        String oldRole = user.getRole() != null ? user.getRole().name() : null;
        String newRole = request.getRole() != null ? request.getRole().name() : oldRole;

        if (request.getRole() != null && !request.getRole().equals(user.getRole())) {
            roleChanged = true;
            user.setRole(request.getRole());
        }

        Team oldTeam = user.getTeam();

        if (roleChanged && oldTeam != null) {
            if ("MANAGER".equals(oldRole) && oldTeam.getManager() != null && oldTeam.getManager().getId().equals(id)) {
                oldTeam.setManager(null);
                teamRepository.save(oldTeam);
            }
            if ("TEAM_LEAD".equals(oldRole) && oldTeam.getTeamLead() != null && oldTeam.getTeamLead().getId().equals(id)) {
                oldTeam.setTeamLead(null);
                teamRepository.save(oldTeam);
            }
        }

        Team newTeam = null;

        if (request.getTeamId() != null && request.getTeamId() > 0) {
            newTeam = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
        }

        if (newTeam != null) {
            if ("MANAGER".equals(newRole)) {
                if (newTeam.getManager() != null && !newTeam.getManager().getId().equals(id)) {
                    throw new BadRequestException("Team already has a manager: " + newTeam.getManager().getFullName());
                }
                List<Team> managerTeams = teamRepository.findByManagerId(id);
                Long targetTeamId = newTeam.getId();
                if (managerTeams.size() >= 3 && managerTeams.stream().noneMatch(t -> t.getId().equals(targetTeamId))) {
                    throw new BadRequestException("A manager can only be assigned to a maximum of 3 teams.");
                }
                newTeam.setManager(user);
                teamRepository.save(newTeam);
            } else if ("TEAM_LEAD".equals(newRole)) {
                if (newTeam.getTeamLead() != null && !newTeam.getTeamLead().getId().equals(id)) {
                    throw new BadRequestException("Team already has a team lead: " + newTeam.getTeamLead().getFullName());
                }
                newTeam.setTeamLead(user);
                teamRepository.save(newTeam);
            }
            user.setTeam(newTeam);
        } else {
            if (oldTeam != null) {
                if ("MANAGER".equals(oldRole) && oldTeam.getManager() != null && oldTeam.getManager().getId().equals(id)) {
                    oldTeam.setManager(null);
                    teamRepository.save(oldTeam);
                }
                if ("TEAM_LEAD".equals(oldRole) && oldTeam.getTeamLead() != null && oldTeam.getTeamLead().getId().equals(id)) {
                    oldTeam.setTeamLead(null);
                    teamRepository.save(oldTeam);
                }
            }
            user.setTeam(null);
        }

        if (request.getShiftId() != null && request.getShiftId() > 0) {
            Shift shift = shiftRepository.findById(request.getShiftId())
                    .orElseThrow(() -> new ResourceNotFoundException("Shift not found"));
            user.setShift(shift);
        } else {
            user.setShift(null);
        }

        teamRepository.flush();
        userRepository.save(user);
        userRepository.flush();

        auditLogService.log("USER_UPDATED", "User", id, null, "user updated", currentUser);

        return mapToDTO(user);
    }

    @Transactional
    public UserDTO updateMyProfile(Long id, UpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        if (request.getFirstName() != null) user.setFirstName(request.getFirstName());
        if (request.getLastName() != null) user.setLastName(request.getLastName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        userRepository.save(user);
        return mapToDTO(user);
    }

    @Transactional
    public void changeMyPassword(Long id, ChangePasswordRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setFirstLogin(false);
        userRepository.save(user);
    }

    @Transactional
    public void resetPassword(Long id, User currentUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setPassword(passwordEncoder.encode("password123"));
        user.setFirstLogin(true);
        userRepository.save(user);

        auditLogService.log("PASSWORD_RESET", "User", id, null, "password reset", currentUser);
    }

    private UserDTO mapToDTO(User user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setPublicId(user.getPublicId());
        dto.setUsername(user.getUsername());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setFirstLogin(user.isFirstLogin());
        dto.setCreatedAt(user.getCreatedAt());

        if (user.getRole().name().equals("MANAGER")) {
            List<Team> managedTeams = teamRepository.findByManagerId(user.getId());
            if (!managedTeams.isEmpty()) {
                dto.setTeamName(managedTeams.stream().map(Team::getName).collect(Collectors.joining(", ")));
                // Also set a representative teamId if needed, though frontend mostly cares about name
                dto.setTeamId(managedTeams.get(0).getId());
            }
        } else if (user.getTeam() != null) {
            dto.setTeamId(user.getTeam().getId());
            dto.setTeamName(user.getTeam().getName());
        }

        if (user.getShift() != null) {
            dto.setShiftId(user.getShift().getId());
            dto.setShiftName(user.getShift().getName());
        }

        return dto;
    }
}
