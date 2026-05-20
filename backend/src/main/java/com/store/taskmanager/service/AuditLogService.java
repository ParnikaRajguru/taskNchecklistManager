package com.store.taskmanager.service;

import com.store.taskmanager.dto.AuditLogDTO;
import com.store.taskmanager.entity.AuditLog;
import com.store.taskmanager.entity.User;
import com.store.taskmanager.entity.Team;
import com.store.taskmanager.repository.AuditLogRepository;
import com.store.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Transactional
    public void log(String action, String entityType, Long entityId, String oldValue, String newValue, User performedBy) {
        AuditLog auditLog = new AuditLog();
        auditLog.setAction(action);
        auditLog.setEntityType(entityType);
        auditLog.setEntityId(entityId);
        auditLog.setOldValue(oldValue);
        auditLog.setNewValue(newValue);
        auditLog.setPerformedBy(performedBy);

        auditLogRepository.save(auditLog);
        auditLogRepository.flush();
    }

    public List<AuditLogDTO> getAllLogs(User currentUser) {
        List<AuditLog> logs;
        String role = currentUser.getRole().name();

        if (role.equals("SUPER_ADMIN")) {
            logs = auditLogRepository.findAllLogsOrdered();
        } else if (role.equals("MANAGER")) {
            logs = getManagerLogs(currentUser);
        } else if (role.equals("TEAM_LEAD")) {
            logs = getTeamMemberLogs(currentUser);
        } else {
            logs = auditLogRepository.findAllNonAdminLogs();
        }
        return logs.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AuditLogDTO> getRecentLogs(int days, User currentUser) {
        List<AuditLog> logs = auditLogRepository.findRecentLogs(
                java.time.LocalDateTime.now().minusDays(days)
        );

        String role = currentUser.getRole().name();

        if (role.equals("SUPER_ADMIN")) {
        } else if (role.equals("MANAGER")) {
            Set<Long> managerMemberIds = getManagerMemberIds(currentUser);
            managerMemberIds.add(currentUser.getId());
            logs = logs.stream()
                    .filter(log -> log.getPerformedBy() != null
                            && managerMemberIds.contains(log.getPerformedBy().getId()))
                    .collect(Collectors.toList());
        } else if (role.equals("TEAM_LEAD")) {
            Set<Long> teamMemberIds = getTeamMemberIds(currentUser);
            logs = logs.stream()
                    .filter(log -> log.getPerformedBy() != null && teamMemberIds.contains(log.getPerformedBy().getId()))
                    .collect(Collectors.toList());
        } else {
            logs = logs.stream()
                    .filter(log -> log.getPerformedBy() != null
                            && !log.getPerformedBy().getRole().name().equals("SUPER_ADMIN"))
                    .collect(Collectors.toList());
        }

        return logs.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public List<AuditLogDTO> getLogsByUser(Long userId, User currentUser) {
        List<AuditLog> logs = auditLogRepository.findByPerformedByIdOrderByTimestampDesc(userId);

        String role = currentUser.getRole().name();

        if (role.equals("SUPER_ADMIN")) {
        } else if (role.equals("MANAGER")) {
            Set<Long> managerMemberIds = getManagerMemberIds(currentUser);
            managerMemberIds.add(currentUser.getId());
            logs = logs.stream()
                    .filter(log -> log.getPerformedBy() != null
                            && managerMemberIds.contains(log.getPerformedBy().getId()))
                    .collect(Collectors.toList());
        } else if (role.equals("TEAM_LEAD")) {
            Set<Long> teamMemberIds = getTeamMemberIds(currentUser);
            logs = logs.stream()
                    .filter(log -> log.getPerformedBy() != null && teamMemberIds.contains(log.getPerformedBy().getId()))
                    .collect(Collectors.toList());
        } else {
            logs = logs.stream()
                    .filter(log -> log.getPerformedBy() != null
                            && !log.getPerformedBy().getRole().name().equals("SUPER_ADMIN"))
                    .collect(Collectors.toList());
        }

        return logs.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    private Set<Long> getTeamMemberIds(User currentUser) {
        Team userTeam = currentUser.getTeam();
        if (userTeam == null) {
            return Set.of(currentUser.getId());
        }
        return userRepository.findByTeamId(userTeam.getId())
                .stream()
                .map(User::getId)
                .collect(Collectors.toSet());
    }

    private List<AuditLog> getTeamMemberLogs(User currentUser) {
        Set<Long> teamMemberIds = getTeamMemberIds(currentUser);
        return auditLogRepository.findAll().stream()
                .filter(log -> log.getPerformedBy() != null && teamMemberIds.contains(log.getPerformedBy().getId()))
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
                .collect(Collectors.toList());
    }

    private Set<Long> getManagerMemberIds(User currentUser) {
        return userRepository.findByTeamManagerId(currentUser.getId())
                .stream()
                .map(User::getId)
                .collect(Collectors.toSet());
    }

    private List<AuditLog> getManagerLogs(User currentUser) {
        Set<Long> managerMemberIds = getManagerMemberIds(currentUser);
        managerMemberIds.add(currentUser.getId());
        return auditLogRepository.findAll().stream()
                .filter(log -> log.getPerformedBy() != null && managerMemberIds.contains(log.getPerformedBy().getId()))
                .sorted((a, b) -> b.getTimestamp().compareTo(a.getTimestamp()))
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
            dto.setPerformedByRole(log.getPerformedBy().getRole());
        }

        return dto;
    }
}