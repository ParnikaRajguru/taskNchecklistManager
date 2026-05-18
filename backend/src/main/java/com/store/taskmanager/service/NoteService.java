package com.store.taskmanager.service;

import com.store.taskmanager.dto.NoteDTO;
import com.store.taskmanager.entity.Note;
import com.store.taskmanager.entity.Task;
import com.store.taskmanager.entity.User;
import com.store.taskmanager.exception.ResourceNotFoundException;
import com.store.taskmanager.repository.NoteRepository;
import com.store.taskmanager.repository.TaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NoteService {

    private final NoteRepository noteRepository;
    private final TaskRepository taskRepository;
    private final AuditLogService auditLogService;

    @Transactional
    public NoteDTO addNote(Long taskId, String content, User currentUser) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with id: " + taskId));

        Note note = new Note();
        note.setContent(content);
        note.setTask(task);
        note.setCreatedBy(currentUser);

        note = noteRepository.save(note);

        auditLogService.log("NOTE_ADDED", "Task", taskId, null, "note added: " + content.substring(0, Math.min(50, content.length())), currentUser);

        return mapToDTO(note);
    }

    public List<NoteDTO> getNotesByTask(Long taskId) {
        return noteRepository.findByTaskIdOrderByCreatedAtDesc(taskId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public NoteDTO updateNote(Long noteId, String content, User currentUser) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + noteId));

        String oldContent = note.getContent();
        note.setContent(content);
        note = noteRepository.save(note);

        auditLogService.log("NOTE_UPDATED", "Task", note.getTask().getId(), oldContent, content, currentUser);

        return mapToDTO(note);
    }

    @Transactional
    public void deleteNote(Long noteId, User currentUser) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + noteId));

        Long taskId = note.getTask().getId();
        String content = note.getContent();

        noteRepository.delete(note);

        auditLogService.log("NOTE_DELETED", "Task", taskId, content, null, currentUser);
    }

    private NoteDTO mapToDTO(Note note) {
        NoteDTO dto = new NoteDTO();
        dto.setId(note.getId());
        dto.setContent(note.getContent());
        dto.setTaskId(note.getTask().getId());
        dto.setTaskTitle(note.getTask().getTitle());
        dto.setCreatedById(note.getCreatedBy().getId());
        dto.setCreatedByName(note.getCreatedBy().getFirstName() + " " + note.getCreatedBy().getLastName());
        dto.setCreatedByRole(note.getCreatedBy().getRole());
        dto.setCreatedAt(note.getCreatedAt());
        dto.setUpdatedAt(note.getUpdatedAt());
        return dto;
    }
}