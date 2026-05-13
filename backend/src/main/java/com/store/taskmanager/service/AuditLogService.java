package com.store.taskmanager.service;

import com.store.taskmanager.dto.AuditLogDTO;
import com.store.taskmanager.entity.AuditLog;
import com.store.taskmanager.entity.User;
import com.store.taskmanager.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogService {
    
    private final AuditLogRepository auditLogRepository;
    
    public void log(String action, String entityType, Long entityId, String oldValue, String newValue, User performedBy) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setOldValue(oldValue);
        auditLog.setNewValue(newValue);
        auditLog.setPerformedBy(performedBy);
        
        auditLogRepository.save(auditLog);
    }
    
    public List<AuditLogDTO> getAllLogs() {
        return auditLogRepository.findAll().stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<AuditLogDTO> getRecentLogs(int days) {
        return auditLogRepository.findRecentLogs(
                java.time.LocalDateTime.now().minusDays(days)
        ).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<AuditLogDTO> getLogsByUser(Long userId) {
        return auditLogRepository.findByPerformedById(userId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    private AuditLogDTO mapToDTO(AuditLog log) {
        AuditLogDTO dto = new AuditLogDTO();
        dto.setId(log.getId());
        dto.setAction(log.getAction());
        dto.setEntityType(log.getEntityType());
        dto.setEntityId(log.getEntityId());
        dto.setOldValue(log.getOldValue());
        dto.setNewValue(log.getNewValue());
        dto.setTimestamp(log.getTimestamp());
        
        if (log.getPerformedBy() != null) {
            dto.setPerformedById(log.getPerformedBy().getId());
            dto.setPerformedByName(log.getPerformedBy().getFullName());
        }
        
        return dto;
    }
}