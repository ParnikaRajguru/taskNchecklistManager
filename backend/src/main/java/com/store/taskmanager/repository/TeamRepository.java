package com.store.taskmanager.repository;

import com.store.taskmanager.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByProjectId(Long projectId);
    List<Team> findByTeamLeadId(Long teamLeadId);
    Optional<Team> findByTeamLeadIdAndIdNot(Long teamLeadId, Long teamId);
    List<Team> findByManagerId(Long managerId);
    List<Team> findByManagerIdAndIdNot(Long managerId, Long teamId);
    Optional<Team> findByPublicId(String publicId);
}
