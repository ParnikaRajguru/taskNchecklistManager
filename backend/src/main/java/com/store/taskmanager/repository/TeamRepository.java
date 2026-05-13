package com.store.taskmanager.repository;

import com.store.taskmanager.entity.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {
    List<Team> findByProjectId(Long projectId);
    List<Team> findByTeamLeadId(Long teamLeadId);
    List<Team> findByTeamManagerId(Long teamManagerId);
}
