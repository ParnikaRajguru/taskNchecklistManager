package com.store.taskmanager.repository;

import com.store.taskmanager.entity.ChecklistItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ChecklistItemRepository extends JpaRepository<ChecklistItem, Long> {
    List<ChecklistItem> findByChecklistId(Long checklistId);
    List<ChecklistItem> findByAssignedToId(Long userId);
    
    @Query("SELECT ci FROM ChecklistItem ci WHERE ci.checklist.shift.id = ?1 AND ci.completed = false")
    List<ChecklistItem> findPendingItemsByShiftId(Long shiftId);
}