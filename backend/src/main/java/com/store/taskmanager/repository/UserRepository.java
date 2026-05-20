package com.store.taskmanager.repository;

import com.store.taskmanager.entity.User;
import com.store.taskmanager.entity.enums.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<User> findByRole(Role role);
    List<User> findByTeamId(Long teamId);
    List<User> findByShiftId(Long shiftId);
    Optional<User> findByPublicId(String publicId);
    List<User> findByTeamManagerId(Long managerId);
    List<User> findByTeamTeamLeadId(Long teamLeadId);
}
