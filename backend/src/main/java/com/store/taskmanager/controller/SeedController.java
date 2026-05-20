package com.store.taskmanager.controller;

import com.store.taskmanager.entity.*;
import com.store.taskmanager.entity.enums.TaskPriority;
import com.store.taskmanager.entity.enums.TaskStatus;
import com.store.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.Arrays;
import java.util.Random;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/seed")
@RequiredArgsConstructor
public class SeedController {

    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final UserRepository userRepository;
    private final TaskRepository taskRepository;
    private final ChecklistRepository checklistRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final ShiftRepository shiftRepository;

    @PostMapping
    public ResponseEntity<String> seedData() {
        Random random = new Random();

        // 1. Fetch existing users, teams, and shifts
        List<User> managers = userRepository.findAll().stream()
                .filter(u -> "MANAGER".equals(u.getRole().name()))
                .collect(Collectors.toList());
        List<User> teamLeads = userRepository.findAll().stream()
                .filter(u -> "TEAM_LEAD".equals(u.getRole().name()))
                .collect(Collectors.toList());
        List<User> staff = userRepository.findAll().stream()
                .filter(u -> Arrays.asList("STAFF", "DEVELOPER", "TESTER").contains(u.getRole().name()))
                .collect(Collectors.toList());
        List<Team> existingTeams = teamRepository.findAll();
        List<Shift> existingShifts = shiftRepository.findAll();

        if (existingTeams.isEmpty()) {
            return ResponseEntity.badRequest().body("No teams found. Please create at least one team first.");
        }
        if (managers.isEmpty()) {
            return ResponseEntity.badRequest().body("No managers found. Please create at least one manager first.");
        }
        if (staff.isEmpty()) {
            return ResponseEntity.badRequest().body("No staff found. Please create at least one staff member first.");
        }

        // 2. Create Dummy Projects
        String[] projectNames = {"Logistics Platform", "Inventory Management", "Customer Support Portal", "Store Revamp", "Database Migration", "HR Management System"};
        for (String pName : projectNames) {
            Project project = new Project();
            project.setName(pName);
            project.setDescription("Description for " + pName);
            project.setStatus("ACTIVE");
            project.setStartDate(LocalDate.now().minusDays(random.nextInt(30)));
            project.setEndDate(LocalDate.now().plusDays(random.nextInt(60) + 10));
            project.setPublicId("PRJ-" + UUID.randomUUID().toString().substring(0, 5).toUpperCase());
            projectRepository.save(project);

            // Assign a random existing team to this project
            Team randomTeam = existingTeams.get(random.nextInt(existingTeams.size()));
            randomTeam.setProject(project);
            teamRepository.save(randomTeam);
        }
        projectRepository.flush();

        // Refresh teams
        existingTeams = teamRepository.findAll();

        // 3. Create Dummy Tasks
        String[] taskTitles = {"Update DB schema", "Fix login bug", "Design landing page", "Write API documentation", "Test payment gateway", "Deploy to staging", "Optimize images", "Client meeting preparation", "Review pull requests", "Setup CI/CD pipeline"};
        for (int i = 0; i < 20; i++) {
            Task task = new Task();
            task.setTitle(taskTitles[i % taskTitles.length] + " " + i);
            task.setDescription("Task description " + i);
            task.setStatus(TaskStatus.values()[random.nextInt(TaskStatus.values().length)]);
            task.setPriority(TaskPriority.values()[random.nextInt(TaskPriority.values().length)]);
            task.setDueDate(LocalDate.now().plusDays(random.nextInt(20) - 5)); // Some overdue
            
            Team randomTeam = existingTeams.get(random.nextInt(existingTeams.size()));
            task.setTeam(randomTeam);
            if (randomTeam.getProject() != null) {
                task.setProject(randomTeam.getProject());
            }

            // Assign to a random staff member
            User randomStaff = staff.get(random.nextInt(staff.size()));
            task.setAssignedTo(randomStaff);

            taskRepository.save(task);
        }

        // 4. Create Dummy Checklists
        String[] checklistTitles = {"Morning Shift Checklist", "Inventory Checklist", "Security Checklist", "Deployment Checklist", "Daily Store Checklist"};
        for (String cTitle : checklistTitles) {
            Checklist checklist = new Checklist();
            checklist.setTitle(cTitle);
            checklist.setDescription("Checklist description for " + cTitle);
            
            Team randomTeam = existingTeams.get(random.nextInt(existingTeams.size()));
            checklist.setTeam(randomTeam);

            if (!existingShifts.isEmpty()) {
                checklist.setShift(existingShifts.get(random.nextInt(existingShifts.size())));
            }

            checklist.setCreatedBy(managers.get(random.nextInt(managers.size())));
            checklist = checklistRepository.save(checklist);

            // Create checklist items
            for (int i = 0; i < 5; i++) {
                ChecklistItem item = new ChecklistItem();
                item.setChecklist(checklist);
                item.setTitle("Item " + i + " for " + cTitle);
                item.setCompleted(random.nextBoolean());
                if (item.isCompleted()) {
                    item.setCompletedAt(LocalDateTime.now().minusHours(random.nextInt(10)));
                }
                item.setAssignedTo(staff.get(random.nextInt(staff.size())));
                checklistItemRepository.save(item);
            }
        }

        return ResponseEntity.ok("Dummy data created successfully!");
    }
}
