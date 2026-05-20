package com.store.taskmanager.repository;

import com.store.taskmanager.entity.Task;
import com.store.taskmanager.entity.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);
    List<Task> findByTeamId(Long teamId);
    List<Task> findByAssignedToId(Long userId);
    List<Task> findByStatus(TaskStatus status);
    List<Task> findByCreatedById(Long userId);
    List<Task> findByTeamManagerId(Long managerId);

    @Query("SELECT t FROM Task t WHERE t.assignedTo.id = ?1 AND t.status != 'COMPLETED'")
    List<Task> findPendingTasksByUserId(Long userId);

    @Query("SELECT t FROM Task t WHERE t.dueDate < ?1 AND t.status != 'COMPLETED'")
    List<Task> findOverdueTasks(LocalDate date);

    @Query("SELECT t FROM Task t WHERE t.team.id = ?1 AND t.status != 'COMPLETED'")
    List<Task> findPendingTasksByTeamId(Long teamId);
}
