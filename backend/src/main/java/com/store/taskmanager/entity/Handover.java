package com.store.taskmanager.entity;

import com.store.taskmanager.entity.enums.HandoverPriority;
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
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private Shift fromShift;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "to_shift_id")
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private Shift toShift;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_team_id")
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private Team assignedTeam;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "receiving_team_id")
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private Team receivingTeam;

    @Enumerated(EnumType.STRING)
    private HandoverPriority priority = HandoverPriority.MEDIUM;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "project_id")
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private Project project;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private User createdBy;

    private boolean resolved = false;

    private boolean acknowledged = false;

    private LocalDateTime acknowledgedAt;

    @OneToMany(mappedBy = "handover", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @lombok.ToString.Exclude
    @lombok.EqualsAndHashCode.Exclude
    private List<HandoverNote> notes = new ArrayList<>();

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
