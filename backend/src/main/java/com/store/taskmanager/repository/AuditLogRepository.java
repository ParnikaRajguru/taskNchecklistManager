package com.store.taskmanager.repository;

import com.store.taskmanager.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByPerformedById(Long userId);
    List<AuditLog> findByEntityTypeAndEntityId(String entityType, Long entityId);
    
    @Query("SELECT a FROM AuditLog a WHERE a.timestamp >= ?1 ORDER BY a.timestamp DESC")
    List<AuditLog> findRecentLogs(LocalDateTime since);
}