package com.store.taskmanager.controller;

import com.store.taskmanager.dto.*;
import com.store.taskmanager.entity.User;
import com.store.taskmanager.repository.UserRepository;
import com.store.taskmanager.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teams")
@RequiredArgsConstructor
public class TeamController {
    
    private final TeamService teamService;
    private final UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<List<TeamDTO>> getAllTeams() {
        return ResponseEntity.ok(teamService.getAllTeams());
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<TeamDTO> getTeamById(@PathVariable Long id) {
        return ResponseEntity.ok(teamService.getTeamById(id));
    }
    
    @GetMapping("/by-project/{projectId}")
    public ResponseEntity<List<TeamDTO>> getTeamsByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(teamService.getTeamsByProject(projectId));
    }
    
    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROJECT_MANAGER', 'MANAGER')")
    public ResponseEntity<TeamDTO> createTeam(
            @Valid @RequestBody CreateTeamRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(teamService.createTeam(request, currentUser));
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROJECT_MANAGER', 'MANAGER')")
    public ResponseEntity<TeamDTO> updateTeam(
            @PathVariable Long id,
            @Valid @RequestBody CreateTeamRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(teamService.updateTeam(id, request, currentUser));
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROJECT_MANAGER')")
    public ResponseEntity<String> deleteTeam(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        teamService.deleteTeam(id, currentUser);
        return ResponseEntity.ok("Team deleted successfully");
    }
}