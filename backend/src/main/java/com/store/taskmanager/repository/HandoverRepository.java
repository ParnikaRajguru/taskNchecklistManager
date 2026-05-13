package com.store.taskmanager.repository;

import com.store.taskmanager.entity.Handover;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HandoverRepository extends JpaRepository<Handover, Long> {
    List<Handover> findByFromShiftId(Long shiftId);
    List<Handover> findByToShiftId(Long shiftId);
    List<Handover> findByCreatedById(Long userId);
    
    @Query("SELECT h FROM Handover h WHERE h.resolved = false AND h.toShift.id = ?1")
    List<Handover> findUnresolvedByShiftId(Long shiftId);
}