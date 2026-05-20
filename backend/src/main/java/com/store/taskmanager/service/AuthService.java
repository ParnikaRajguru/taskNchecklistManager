package com.store.taskmanager.service;

import com.store.taskmanager.dto.*;
import com.store.taskmanager.entity.Team;
import com.store.taskmanager.entity.User;
import com.store.taskmanager.exception.BadRequestException;
import com.store.taskmanager.exception.ResourceNotFoundException;
import com.store.taskmanager.repository.UserRepository;
import com.store.taskmanager.repository.TeamRepository;
import com.store.taskmanager.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;
    private final AuditLogService auditLogService;

    @Transactional
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new BadRequestException("Invalid username or password"));

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication);

        auditLogService.log("LOGIN", "User", user.getId(), null, "user logged in", user);

        return new LoginResponse(
                token,
                "Bearer",
                user.getId(),
                user.getUsername(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().name(),
                user.getTeam() != null ? user.getTeam().getId() : null,
                user.getShift() != null ? user.getShift().getId() : null,
                user.isFirstLogin()
        );
    }

    public void changePassword(Long userId, ChangePasswordRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("New password and confirm password do not match");
        }

        if (request.getNewPassword().length() < 6) {
            throw new BadRequestException("Password must be at least 6 characters");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setFirstLogin(false);
        userRepository.save(user);

        auditLogService.log("PASSWORD_CHANGE", "User", userId, null, "password changed", user);
    }

    public void createUser(CreateUserRequest request, User currentUser) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new BadRequestException("Username already exists");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setFirstLogin(true);

        user.setPublicId(generateNextUserPublicId());

        if (request.getTeamId() != null && request.getTeamId() > 0) {
            Team team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found"));

            String roleName = request.getRole() != null ? request.getRole().name() : null;
            if ("MANAGER".equals(roleName)) {
                if (team.getManager() != null) {
                    throw new BadRequestException("Team already has a manager: " + team.getManager().getFullName());
                }
                team.setManager(user);
                teamRepository.save(team);
                teamRepository.flush();
            } else if ("TEAM_LEAD".equals(roleName)) {
                if (team.getTeamLead() != null) {
                    throw new BadRequestException("Team already has a team lead: " + team.getTeamLead().getFullName());
                }
                team.setTeamLead(user);
                teamRepository.save(team);
                teamRepository.flush();
            }
            user.setTeam(team);
        }

        userRepository.save(user);
        userRepository.flush();

        auditLogService.log("USER_CREATED", "User", user.getId(), null, "user created", currentUser);
    }

    private String generateNextUserPublicId() {
        long count = userRepository.count();
        String publicId;
        int counter = 1;
        do {
            publicId = String.format("USR-%03d", count + counter);
            counter++;
        } while (userRepository.findByPublicId(publicId).isPresent());
        return publicId;
    }

    @Transactional
    public void logout(User user) {
        if (user != null) {
            auditLogService.log("LOGOUT", "User", user.getId(), null, "user logged out", user);
        }
    }
}
