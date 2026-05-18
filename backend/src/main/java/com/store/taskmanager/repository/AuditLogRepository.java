package com.store.taskmanager.repository;

import com.store.taskmanager.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByPerformedByIdOrderByTimestampDesc(Long userId);
    List<AuditLog> findByEntityTypeAndEntityIdOrderByTimestampDesc(String entityType, Long entityId);

    @Query("SELECT a FROM AuditLog a WHERE a.timestamp >= ?1 ORDER BY a.timestamp DESC")
    List<AuditLog> findRecentLogs(LocalDateTime since);

    @Query("SELECT a FROM AuditLog a WHERE a.performedBy.role != 'SUPER_ADMIN' ORDER BY a.timestamp DESC")
    List<AuditLog> findAllNonAdminLogs();

    @Query("SELECT a FROM AuditLog a ORDER BY a.timestamp DESC")
    List<AuditLog> findAllLogsOrdered();
}