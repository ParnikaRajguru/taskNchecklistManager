package com.store.taskmanager.controller;

import com.store.taskmanager.dto.*;
import com.store.taskmanager.entity.User;
import com.store.taskmanager.repository.UserRepository;
import com.store.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final TaskService taskService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<TaskDTO>> getAllTasks(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (user.getRole().name().equals("SUPER_ADMIN")) {
            return ResponseEntity.ok(taskService.getAllTasks());
        }
        if (user.getRole().name().equals("MANAGER")) {
            return ResponseEntity.ok(taskService.getTasksByManager(user.getId()));
        }
        return ResponseEntity.ok(taskService.getAccessibleTasks(user));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable Long id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    @GetMapping("/by-project/{projectId}")
    public ResponseEntity<List<TaskDTO>> getTasksByProject(@PathVariable Long projectId) {
        return ResponseEntity.ok(taskService.getTasksByProject(projectId));
    }

    @GetMapping("/by-team/{teamId}")
    public ResponseEntity<List<TaskDTO>> getTasksByTeam(@PathVariable Long teamId) {
        return ResponseEntity.ok(taskService.getTasksByTeam(teamId));
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<List<TaskDTO>> getTasksByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(taskService.getTasksByUser(userId));
    }

    @GetMapping("/by-team-and-project")
    public ResponseEntity<List<TaskDTO>> getTasksByTeamAndProject(
            @RequestParam Long teamId,
            @RequestParam Long projectId) {
        return ResponseEntity.ok(taskService.getTasksByTeamAndProject(teamId, projectId));
    }

    @GetMapping("/my-tasks")
    public ResponseEntity<List<TaskDTO>> getMyTasks(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(taskService.getTasksByUser(user.getId()));
    }

    @GetMapping("/my-pending")
    public ResponseEntity<List<TaskDTO>> getMyPendingTasks(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(taskService.getPendingTasksByUser(user.getId()));
    }

    @GetMapping("/overdue")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    public ResponseEntity<List<TaskDTO>> getOverdueTasks() {
        return ResponseEntity.ok(taskService.getOverdueTasks());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER', 'TEAM_LEAD')")
    public ResponseEntity<TaskDTO> createTask(
            @Valid @RequestBody CreateTaskRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(taskService.createTask(request, currentUser));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskDTO> updateTask(
            @PathVariable Long id,
            @RequestBody UpdateTaskRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(taskService.updateTask(id, request, currentUser));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER', 'TEAM_LEAD')")
    public ResponseEntity<String> deleteTask(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        taskService.deleteTask(id, currentUser);
        return ResponseEntity.ok("Task deleted successfully");
    }
}
