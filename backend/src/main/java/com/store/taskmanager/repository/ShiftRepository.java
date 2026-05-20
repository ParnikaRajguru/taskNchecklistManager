package com.store.taskmanager.repository;

import com.store.taskmanager.entity.Shift;
import com.store.taskmanager.entity.enums.ShiftType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ShiftRepository extends JpaRepository<Shift, Long> {
    List<Shift> findByShiftType(ShiftType shiftType);
    List<Shift> findByActiveTrue();
    List<Shift> findByTeamId(Long teamId);
}