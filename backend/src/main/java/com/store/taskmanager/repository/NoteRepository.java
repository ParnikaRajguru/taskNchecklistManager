package com.store.taskmanager.repository;

import com.store.taskmanager.entity.Note;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {
    List<Note> findByTaskIdOrderByCreatedAtDesc(Long taskId);
}