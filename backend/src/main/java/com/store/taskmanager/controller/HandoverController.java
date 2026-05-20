package com.store.taskmanager.controller;

import com.store.taskmanager.dto.*;
import com.store.taskmanager.entity.User;
import com.store.taskmanager.repository.UserRepository;
import com.store.taskmanager.service.HandoverService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/handovers")
@RequiredArgsConstructor
public class HandoverController {

    private final HandoverService handoverService;
    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<HandoverDTO>> getAllHandovers(@AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (currentUser.getRole().name().equals("SUPER_ADMIN")) {
            return ResponseEntity.ok(handoverService.getAllHandovers());
        } else if (currentUser.getRole().name().equals("MANAGER")) {
            return ResponseEntity.ok(handoverService.getHandoversByManager(currentUser.getId()));
        }
        return ResponseEntity.ok(handoverService.getAllHandovers()); // fallback or handle team lead
    }

    @GetMapping("/{id}")
    public ResponseEntity<HandoverDTO> getHandoverById(@PathVariable Long id) {
        return ResponseEntity.ok(handoverService.getHandoverById(id));
    }

    @GetMapping("/by-shift/{shiftId}")
    public ResponseEntity<List<HandoverDTO>> getHandoversByShift(@PathVariable Long shiftId) {
        return ResponseEntity.ok(handoverService.getHandoversByShift(shiftId));
    }

    @GetMapping("/unresolved/{shiftId}")
    public ResponseEntity<List<HandoverDTO>> getUnresolvedHandovers(@PathVariable Long shiftId) {
        return ResponseEntity.ok(handoverService.getUnresolvedHandovers(shiftId));
    }

    @GetMapping("/by-team/{teamId}")
    public ResponseEntity<List<HandoverDTO>> getHandoversByAssignedTeam(@PathVariable Long teamId) {
        return ResponseEntity.ok(handoverService.getHandoversByAssignedTeam(teamId));
    }

    @GetMapping("/unacknowledged/{teamId}")
    public ResponseEntity<List<HandoverDTO>> getUnacknowledgedHandovers(@PathVariable Long teamId) {
        return ResponseEntity.ok(handoverService.getUnacknowledgedHandovers(teamId));
    }

    @PostMapping
    public ResponseEntity<HandoverDTO> createHandover(
            @Valid @RequestBody CreateHandoverRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(handoverService.createHandover(request, currentUser));
    }

    @PutMapping("/{id}/resolve")
    public ResponseEntity<HandoverDTO> resolveHandover(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(handoverService.resolveHandover(id, currentUser));
    }

    @PutMapping("/{id}/acknowledge")
    public ResponseEntity<HandoverDTO> acknowledgeHandover(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(handoverService.acknowledgeHandover(id, currentUser));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteHandover(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        handoverService.deleteHandover(id, currentUser);
        return ResponseEntity.ok("Handover deleted successfully");
    }
}
