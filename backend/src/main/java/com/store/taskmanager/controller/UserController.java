package com.store.taskmanager.controller;

import com.store.taskmanager.dto.*;
import com.store.taskmanager.entity.User;
import com.store.taskmanager.repository.UserRepository;
import com.store.taskmanager.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    
    private final UserService userService;
    private final UserRepository userRepository;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROJECT_MANAGER', 'MANAGER', 'TEAM_LEAD')")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<UserDTO> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
    
    @GetMapping("/by-team/{teamId}")
    public ResponseEntity<List<UserDTO>> getUsersByTeam(@PathVariable Long teamId) {
        return ResponseEntity.ok(userService.getUsersByTeam(teamId));
    }
    
    @GetMapping("/by-role/{role}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROJECT_MANAGER', 'MANAGER')")
    public ResponseEntity<List<UserDTO>> getUsersByRole(@PathVariable String role) {
        return ResponseEntity.ok(userService.getUsersByRole(role));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROJECT_MANAGER', 'MANAGER')")
    public ResponseEntity<UserDTO> updateUser(
            @PathVariable Long id,
            @RequestBody UpdateUserRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(userService.updateUser(id, request, currentUser));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROJECT_MANAGER', 'MANAGER')")
    public ResponseEntity<String> deactivateUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        userService.deactivateUser(id, currentUser);
        return ResponseEntity.ok("User deactivated successfully");
    }
    
    @PostMapping("/{id}/reset-password")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROJECT_MANAGER', 'MANAGER')")
    public ResponseEntity<String> resetPassword(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        userService.resetPassword(id, currentUser);
        return ResponseEntity.ok("Password reset successfully");
    }
}