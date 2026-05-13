package com.store.taskmanager.service;

import com.store.taskmanager.dto.*;
import com.store.taskmanager.entity.User;
import com.store.taskmanager.entity.Team;
import com.store.taskmanager.entity.Shift;
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
        return userRepository.findByActiveTrue().stream()
                .filter(u -> u.getRole().name().equals(role))
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
        if (request.getRole() != null) user.setRole(request.getRole());
        if (request.getActive() != null) user.setActive(request.getActive());
        
        if (request.getTeamId() != null) {
            Team team = teamRepository.findById(request.getTeamId())
                    .orElseThrow(() -> new ResourceNotFoundException("Team not found"));
            user.setTeam(team);
        }
        
        if (request.getShiftId() != null) {
            Shift shift = shiftRepository.findById(request.getShiftId())
                    .orElseThrow(() -> new ResourceNotFoundException("Shift not found"));
            user.setShift(shift);
        }
        
        userRepository.save(user);
        
        auditLogService.log("USER_UPDATED", "User", id, null, "user updated", currentUser);
        
        return mapToDTO(user);
    }
    
    @Transactional
    public void deactivateUser(Long id, User currentUser) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        
        user.setActive(false);
        userRepository.save(user);
        
        auditLogService.log("USER_DEACTIVATED", "User", id, null, "user deactivated", currentUser);
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
        dto.setUsername(user.getUsername());
        dto.setFirstName(user.getFirstName());
        dto.setLastName(user.getLastName());
        dto.setEmail(user.getEmail());
        dto.setPhone(user.getPhone());
        dto.setRole(user.getRole());
        dto.setActive(user.isActive());
        dto.setFirstLogin(user.isFirstLogin());
        dto.setCreatedAt(user.getCreatedAt());
        
        if (user.getTeam() != null) {
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