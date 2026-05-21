package com.store.taskmanager.repository;

import com.store.taskmanager.entity.Checklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ChecklistRepository extends JpaRepository<Checklist, Long> {
    List<Checklist> findByShiftId(Long shiftId);
    List<Checklist> findByTeamId(Long teamId);
    List<Checklist> findByTaskId(Long taskId);
    List<Checklist> findByCreatedById(Long userId);
    List<Checklist> findByTeamManagerId(Long managerId);

    @Query("SELECT c FROM Checklist c WHERE c.createdAt < ?1 AND c.id IN (SELECT ci.checklist.id FROM ChecklistItem ci WHERE ci.completed = false)")
    List<Checklist> findDelayedChecklists(LocalDateTime date);
}
