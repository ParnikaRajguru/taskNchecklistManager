package com.store.taskmanager.repository;

import com.store.taskmanager.entity.Checklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChecklistRepository extends JpaRepository<Checklist, Long> {
    List<Checklist> findByShiftId(Long shiftId);
    List<Checklist> findByTeamId(Long teamId);
    List<Checklist> findByCreatedById(Long userId);
}