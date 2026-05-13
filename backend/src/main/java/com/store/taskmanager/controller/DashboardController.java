package com.store.taskmanager.controller;

import com.store.taskmanager.dto.DashboardDTO;
import com.store.taskmanager.entity.User;
import com.store.taskmanager.repository.UserRepository;
import com.store.taskmanager.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {
    
    private final DashboardService dashboardService;
    private final UserRepository userRepository;
    
    @GetMapping
    public ResponseEntity<DashboardDTO> getDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(dashboardService.getDashboardData(user));
    }
}