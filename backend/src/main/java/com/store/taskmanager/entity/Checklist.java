package com.store.taskmanager.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "checklists")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Checklist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "shift_id")
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private Shift shift;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id")
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "task_id")
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private Task task;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private User createdBy;

    @OneToMany(mappedBy = "checklist", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private List<ChecklistItem> items = new ArrayList<>();

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
