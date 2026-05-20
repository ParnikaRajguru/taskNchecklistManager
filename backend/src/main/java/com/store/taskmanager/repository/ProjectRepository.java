package com.store.taskmanager.repository;

import com.store.taskmanager.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByStatus(String status);
    Optional<Project> findByPublicId(String publicId);
    List<Project> findByTeamsManagerId(Long managerId);
}