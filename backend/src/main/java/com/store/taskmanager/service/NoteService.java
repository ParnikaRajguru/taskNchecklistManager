package com.store.taskmanager.service;

import com.store.taskmanager.dto.*;
import com.store.taskmanager.entity.*;
import com.store.taskmanager.exception.ResourceNotFoundException;
import com.store.taskmanager.repository.*;
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
    private final ChecklistItemRepository checklistItemRepository;
    private final HandoverRepository handoverRepository;
    private final AuditLogService auditLogService;
    
    public List<NoteDTO> getNotesByTask(Long taskId) {
        return noteRepository.findByTaskId(taskId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<NoteDTO> getNotesByChecklistItem(Long checklistItemId) {
        return noteRepository.findByChecklistItemId(checklistItemId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    public List<NoteDTO> getNotesByHandover(Long handoverId) {
        return noteRepository.findByHandoverId(handoverId).stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public NoteDTO createNote(CreateNoteRequest request, User currentUser) {
        Note note = new Note();
        note.setContent(request.getContent());
        note.setCreatedBy(currentUser);
        
        if (request.getTaskId() != null) {
            Task task = taskRepository.findById(request.getTaskId())
                    .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
            note.setTask(task);
            auditLogService.log("NOTE_ADDED", "Task", request.getTaskId(), null, "note added to task", currentUser);
        } else if (request.getChecklistItemId() != null) {
            ChecklistItem item = checklistItemRepository.findById(request.getChecklistItemId())
                    .orElseThrow(() -> new ResourceNotFoundException("Checklist item not found"));
            note.setChecklistItem(item);
            auditLogService.log("NOTE_ADDED", "ChecklistItem", request.getChecklistItemId(), null, "note added to checklist item", currentUser);
        } else if (request.getHandoverId() != null) {
            Handover handover = handoverRepository.findById(request.getHandoverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Handover not found"));
            note.setHandover(handover);
            auditLogService.log("NOTE_ADDED", "Handover", request.getHandoverId(), null, "note added to handover", currentUser);
        }
        
        noteRepository.save(note);
        
        return mapToDTO(note);
    }
    
    @Transactional
    public void deleteNote(Long id, User currentUser) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + id));
        
        auditLogService.log("NOTE_DELETED", "Note", id, null, "note deleted", currentUser);
        
        noteRepository.delete(note);
    }
    
    private NoteDTO mapToDTO(Note note) {
        NoteDTO dto = new NoteDTO();
        dto.setId(note.getId());
        dto.setContent(note.getContent());
        dto.setCreatedAt(note.getCreatedAt());
        
        if (note.getCreatedBy() != null) {
            dto.setCreatedById(note.getCreatedBy().getId());
            dto.setCreatedByName(note.getCreatedBy().getFullName());
        }
        
        if (note.getTask() != null) {
            dto.setTaskId(note.getTask().getId());
        }
        
        if (note.getChecklistItem() != null) {
            dto.setChecklistItemId(note.getChecklistItem().getId());
        }
        
        if (note.getHandover() != null) {
            dto.setHandoverId(note.getHandover().getId());
        }
        
        return dto;
    }
}