package com.store.taskmanager.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "handovers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Handover {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String completedWork;

    @Column(columnDefinition = "TEXT")
    private String pendingWork;

    @Column(columnDefinition = "TEXT")
    private String blockers;

    @Column(columnDefinition = "TEXT")
    private String nextShiftInstructions;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "from_shift_id")
    private Shift fromShift;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_shift_id")
    private Shift toShift;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    private boolean resolved = false;

    @OneToMany(mappedBy = "handover", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Note> notes = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}