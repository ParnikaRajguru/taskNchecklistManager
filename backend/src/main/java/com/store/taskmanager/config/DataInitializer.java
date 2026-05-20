package com.store.taskmanager.config;

import com.store.taskmanager.entity.Project;
import com.store.taskmanager.entity.Team;
import com.store.taskmanager.entity.User;
import com.store.taskmanager.repository.ProjectRepository;
import com.store.taskmanager.repository.TeamRepository;
import com.store.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final TeamRepository teamRepository;
    private final ProjectRepository projectRepository;

    @Override
    public void run(String... args) {
        generateUserPublicIds();
        generateTeamPublicIds();
        generateProjectPublicIds();
    }

    private void generateUserPublicIds() {
        List<User> users = userRepository.findAll();
        int counter = 1;
        for (User user : users) {
            if (user.getPublicId() == null || user.getPublicId().isEmpty()) {
                String publicId;
                do {
                    publicId = String.format("USR-%03d", counter);
                    counter++;
                } while (userRepository.findByPublicId(publicId).isPresent());
                user.setPublicId(publicId);
                userRepository.save(user);
            }
        }
    }

    private void generateTeamPublicIds() {
        List<Team> teams = teamRepository.findAll();
        int counter = 1;
        for (Team team : teams) {
            if (team.getPublicId() == null || team.getPublicId().isEmpty()) {
                String publicId;
                do {
                    publicId = String.format("TEAM-%03d", counter);
                    counter++;
                } while (teamRepository.findByPublicId(publicId).isPresent());
                team.setPublicId(publicId);
                teamRepository.save(team);
            }
        }
    }

    private void generateProjectPublicIds() {
        List<Project> projects = projectRepository.findAll();
        int counter = 1;
        for (Project project : projects) {
            if (project.getPublicId() == null || project.getPublicId().isEmpty()) {
                String publicId;
                do {
                    publicId = String.format("PRJ-%03d", counter);
                    counter++;
                } while (projectRepository.findByPublicId(publicId).isPresent());
                project.setPublicId(publicId);
                projectRepository.save(project);
            }
        }
    }
}