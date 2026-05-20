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

        // Check if user has access to this task
        String role = currentUser.getRole().name();
        boolean hasAccess = false;

        if (role.equals("SUPER_ADMIN") || role.equals("MANAGER") || role.equals("TEAM_LEAD")) {
            hasAccess = true; // These roles can add notes to any accessible task
        } else if (task.getAssignedTo() != null && task.getAssignedTo().getId().equals(currentUser.getId())) {
            hasAccess = true; // Can add notes to own tasks
        } else if (task.getTeam() != null && currentUser.getTeam() != null && task.getTeam().getId().equals(currentUser.getTeam().getId())) {
            hasAccess = true; // Can add notes to team tasks
        }

        if (!hasAccess) {
            throw new com.store.taskmanager.exception.AccessDeniedException("You don't have access to this task");
        }

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
    public NoteDTO updateNote(Long noteId, String content, User currentUser, boolean isAdmin) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + noteId));

        // Allow only the note creator or admin to update
        if (!isAdmin && !note.getCreatedBy().getId().equals(currentUser.getId())) {
            throw new com.store.taskmanager.exception.AccessDeniedException("You can only update your own notes");
        }

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