package com.store.taskmanager.controller;

import com.store.taskmanager.dto.NoteDTO;
import com.store.taskmanager.entity.User;
import com.store.taskmanager.repository.UserRepository;
import com.store.taskmanager.service.NoteService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NoteController {

    private final NoteService noteService;
    private final UserRepository userRepository;

    @GetMapping("/tasks/{taskId}/notes")
    public ResponseEntity<List<NoteDTO>> getNotesByTask(@PathVariable Long taskId) {
        return ResponseEntity.ok(noteService.getNotesByTask(taskId));
    }

    @PostMapping("/tasks/{taskId}/notes")
    public ResponseEntity<NoteDTO> addNote(
            @PathVariable Long taskId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        String content = request.get("content");
        return ResponseEntity.ok(noteService.addNote(taskId, content, currentUser));
    }

    @PutMapping("/notes/{noteId}")
    public ResponseEntity<NoteDTO> updateNote(
            @PathVariable Long noteId,
            @RequestBody Map<String, String> request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        String content = request.get("content");
        boolean isAdmin = currentUser.getRole().name().equals("SUPER_ADMIN");
        return ResponseEntity.ok(noteService.updateNote(noteId, content, currentUser, isAdmin));
    }

    @DeleteMapping("/notes/{noteId}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> deleteNote(
            @PathVariable Long noteId,
            @AuthenticationPrincipal UserDetails userDetails) {
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        noteService.deleteNote(noteId, currentUser);
        return ResponseEntity.ok().build();
    }
}