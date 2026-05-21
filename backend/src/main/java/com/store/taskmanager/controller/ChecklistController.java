package com.store.taskmanager.controller;

import com.store.taskmanager.dto.*;
import com.store.taskmanager.entity.User;
import com.store.taskmanager.repository.UserRepository;
import com.store.taskmanager.service.ChecklistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checklists")
@RequiredArgsConstructor
public class ChecklistController {

    private final ChecklistService checklistService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<ChecklistDTO>> getAllChecklists(@AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(checklistService.getAllChecklists(currentUser));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChecklistDTO> getChecklistById(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(checklistService.getChecklistById(id, currentUser));
    }

    @GetMapping("/by-shift/{shiftId}")
    public ResponseEntity<List<ChecklistDTO>> getChecklistsByShift(@PathVariable Long shiftId, @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(checklistService.getChecklistsByShift(shiftId, currentUser));
    }

    @GetMapping("/by-team/{teamId}")
    public ResponseEntity<List<ChecklistDTO>> getChecklistsByTeam(@PathVariable Long teamId, @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(checklistService.getChecklistsByTeam(teamId, currentUser));
    }

    @GetMapping("/by-task/{taskId}")
    public ResponseEntity<List<ChecklistDTO>> getChecklistsByTask(@PathVariable Long taskId, @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(checklistService.getChecklistsByTask(taskId, currentUser));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER', 'TEAM_LEAD', 'STAFF', 'DEVELOPER', 'TESTER')")
    public ResponseEntity<ChecklistDTO> createChecklist(
            @Valid @RequestBody CreateChecklistRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(checklistService.createChecklist(request, currentUser));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER', 'TEAM_LEAD', 'STAFF', 'DEVELOPER', 'TESTER')")
    public ResponseEntity<ChecklistDTO> updateChecklist(
            @PathVariable Long id,
            @Valid @RequestBody CreateChecklistRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(checklistService.updateChecklist(id, request, currentUser));
    }

    @PutMapping("/items/{itemId}/complete")
    public ResponseEntity<ChecklistItemDTO> completeItem(
            @PathVariable Long itemId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(checklistService.completeItem(itemId, currentUser));
    }

    @PutMapping("/items/{itemId}/uncomplete")
    public ResponseEntity<ChecklistItemDTO> uncompleteItem(
            @PathVariable Long itemId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(checklistService.uncompleteItem(itemId, currentUser));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'MANAGER')")
    public ResponseEntity<String> deleteChecklist(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        checklistService.deleteChecklist(id, currentUser);
        return ResponseEntity.ok("Checklist deleted successfully");
    }
}