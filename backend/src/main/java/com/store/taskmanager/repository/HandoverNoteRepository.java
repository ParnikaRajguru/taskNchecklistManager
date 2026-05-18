package com.store.taskmanager.repository;

import com.store.taskmanager.entity.HandoverNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface HandoverNoteRepository extends JpaRepository<HandoverNote, Long> {
    List<HandoverNote> findByHandoverIdOrderByCreatedAtDesc(Long handoverId);
}