package com.store.taskmanager.controller;

import com.store.taskmanager.dto.AuditLogDTO;
import com.store.taskmanager.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
public class AuditController {
    
    private final AuditLogService auditLogService;
    
    @GetMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROJECT_MANAGER', 'MANAGER')")
    public ResponseEntity<List<AuditLogDTO>> getAllLogs() {
        return ResponseEntity.ok(auditLogService.getAllLogs());
    }
    
    @GetMapping("/recent")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROJECT_MANAGER', 'MANAGER')")
    public ResponseEntity<List<AuditLogDTO>> getRecentLogs(@RequestParam(defaultValue = "7") int days) {
        return ResponseEntity.ok(auditLogService.getRecentLogs(days));
    }
    
    @GetMapping("/by-user/{userId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'PROJECT_MANAGER', 'MANAGER')")
    public ResponseEntity<List<AuditLogDTO>> getLogsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(auditLogService.getLogsByUser(userId));
    }
}