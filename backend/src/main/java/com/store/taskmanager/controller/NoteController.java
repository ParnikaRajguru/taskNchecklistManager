package com.store.taskmanager.controller;

import com.store.taskmanager.dto.*;
import com.store.taskmanager.entity.User;
import com.store.taskmanager.repository.UserRepository;
import com.store.taskmanager.service.NoteService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
@RequiredArgsConstructor
public class NoteController {
    
    private final NoteService noteService;
    private final UserRepository userRepository;
    
    @GetMapping("/by-task/{taskId}")
    public ResponseEntity<List<NoteDTO>> getNotesByTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(noteService.getNotesByTask(taskId));
    }
    
    @GetMapping("/by-checklist-item/{checklistItemId}")
    public ResponseEntity<List<NoteDTO>> getNotesByChecklistItem(@PathVariable Long checklistItemId) {
        return ResponseEntity.ok(noteService.getNotesByChecklistItem(checklistItemId));
    }
    
    @GetMapping("/by-handover/{handoverId}")
    public ResponseEntity<List<NoteDTO>> getNotesByHandover(@PathVariable Long handoverId) {
        return ResponseEntity.ok(noteService.getNotesByHandover(handoverId));
    }
    
    @PostMapping
    public ResponseEntity<NoteDTO> createNote(
            @Valid @RequestBody CreateNoteRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(noteService.createNote(request, currentUser));
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteNote(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        noteService.deleteNote(id, currentUser);
        return ResponseEntity.ok("Note deleted successfully");
    }
}