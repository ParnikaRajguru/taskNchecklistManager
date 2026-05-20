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
    List<Handover> findByAssignedTeamId(Long teamId);
    List<Handover> findByReceivingTeamId(Long teamId);

    @Query("SELECT h FROM Handover h WHERE h.resolved = false AND h.toShift.id = ?1")
    List<Handover> findUnresolvedByShiftId(Long shiftId);

    @Query("SELECT h FROM Handover h WHERE h.acknowledged = false AND h.receivingTeam.id = ?1")
    List<Handover> findUnacknowledgedByTeamId(Long teamId);

    @Query("SELECT h FROM Handover h WHERE h.resolved = false AND h.createdAt < CURRENT_DATE")
    List<Handover> findMissedHandovers();

    @Query("SELECT h FROM Handover h WHERE h.assignedTeam.manager.id = ?1 OR h.receivingTeam.manager.id = ?1")
    List<Handover> findByManagerId(Long managerId);
}
