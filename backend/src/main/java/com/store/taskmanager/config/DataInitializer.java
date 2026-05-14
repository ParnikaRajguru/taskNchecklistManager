package com.store.taskmanager.config;

import com.store.taskmanager.entity.*;
import com.store.taskmanager.entity.enums.*;
import com.store.taskmanager.repository.*;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final UserRepository userRepository;
    private final ShiftRepository shiftRepository;
    private final ProjectRepository projectRepository;
    private final TeamRepository teamRepository;
    private final TaskRepository taskRepository;
    private final ChecklistRepository checklistRepository;
    private final ChecklistItemRepository checklistItemRepository;
    private final HandoverRepository handoverRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initializeShifts();
        initializeDefaultAdmin();

        if (allSeedDataExists()) {
            log.info("Sample data already exists, skipping initialization");
            return;
        }

        initializeSampleUsers();
        initializeProjects();
        initializeTeams();
        initializeTasks();
        initializeChecklists();
        initializeHandovers();

        log.info("========================================");
        log.info("Sample data initialization complete!");
        log.info("Admin: admin / admin123");
        log.info("Manager: john.manager / password123");
        log.info("Lead: sarah.lead / password123");
        log.info("Staff: mike.staff / password123");
        log.info("========================================");
    }

    private boolean allSeedDataExists() {
        return userRepository.count() > 1 && teamRepository.count() > 0 && taskRepository.count() > 0;
    }

    private void initializeShifts() {
        if (shiftRepository.count() > 0) return;

        Shift morning = new Shift();
        morning.setName("Morning Shift");
        morning.setShiftType(ShiftType.MORNING);
        morning.setStartTime(LocalTime.of(6, 0));
        morning.setEndTime(LocalTime.of(14, 0));
        morning.setActive(true);
        shiftRepository.save(morning);

        Shift evening = new Shift();
        evening.setName("Evening Shift");
        evening.setShiftType(ShiftType.EVENING);
        evening.setStartTime(LocalTime.of(14, 0));
        evening.setEndTime(LocalTime.of(22, 0));
        evening.setActive(true);
        shiftRepository.save(evening);

        Shift night = new Shift();
        night.setName("Night Shift");
        night.setShiftType(ShiftType.NIGHT);
        night.setStartTime(LocalTime.of(22, 0));
        night.setEndTime(LocalTime.of(6, 0));
        night.setActive(true);
        shiftRepository.save(night);

        log.info("Created 3 shifts");
    }

    private Shift getShift(ShiftType type) {
        return shiftRepository.findByShiftType(type).stream().findFirst().orElse(null);
    }

    private void initializeDefaultAdmin() {
        if (userRepository.existsByUsername("admin")) return;

        createUser("admin", "admin123", "System", "Administrator", "admin@store.com", Role.SUPER_ADMIN, false);
        log.info("Created admin user");
    }

    private void initializeSampleUsers() {
        if (userRepository.count() > 1) return;

        createUser("john.manager", "password123", "John", "Smith", "john@store.com", Role.MANAGER, false);
        createUser("sarah.lead", "password123", "Sarah", "Johnson", "sarah@store.com", Role.TEAM_LEAD, false);
        createUser("mike.staff", "password123", "Mike", "Davis", "mike@store.com", Role.STAFF, false);
        createUser("emily.staff", "password123", "Emily", "Brown", "emily@store.com", Role.STAFF, false);
        createUser("alex.staff", "password123", "Alex", "Wilson", "alex@store.com", Role.STAFF, false);
        createUser("lisa.staff", "password123", "Lisa", "Martinez", "lisa@store.com", Role.STAFF, false);
        createUser("david.staff", "password123", "David", "Anderson", "david@store.com", Role.STAFF, false);
        createUser("jenny.lead", "password123", "Jenny", "Taylor", "jenny@store.com", Role.TEAM_LEAD, false);

        log.info("Created 8 sample users");
    }

    private void createUser(String username, String password, String firstName, String lastName, String email, Role role, boolean firstLogin) {
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setFirstName(firstName);
        user.setLastName(lastName);
        user.setEmail(email);
        user.setRole(role);
        user.setFirstLogin(firstLogin);
        shiftAssignment(user);
        userRepository.save(user);
    }

    private void shiftAssignment(User user) {
        switch (user.getUsername()) {
            case "john.manager", "sarah.lead", "david.staff" -> user.setShift(getShift(ShiftType.MORNING));
            case "mike.staff", "emily.staff", "jenny.lead" -> user.setShift(getShift(ShiftType.EVENING));
            case "alex.staff", "lisa.staff" -> user.setShift(getShift(ShiftType.NIGHT));
        }
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    private void initializeProjects() {
        if (projectRepository.count() > 0) return;

        Project p1 = new Project();
        p1.setName("Store Website Revamp");
        p1.setDescription("Modernize the store website with new design and features");
        p1.setStatus("ACTIVE");
        p1.setStartDate(LocalDate.now().minusMonths(2));
        p1.setEndDate(LocalDate.now().plusMonths(4));
        projectRepository.save(p1);

        Project p2 = new Project();
        p2.setName("Inventory Management System");
        p2.setDescription("Build a new inventory tracking and management system");
        p2.setStatus("ACTIVE");
        p2.setStartDate(LocalDate.now().minusMonths(1));
        p2.setEndDate(LocalDate.now().plusMonths(6));
        projectRepository.save(p2);

        Project p3 = new Project();
        p3.setName("Customer Loyalty Program");
        p3.setDescription("Implement a new customer rewards and loyalty system");
        p3.setStatus("PLANNING");
        p3.setStartDate(LocalDate.now().plusMonths(1));
        p3.setEndDate(LocalDate.now().plusMonths(7));
        projectRepository.save(p3);

        log.info("Created 3 projects");
    }

    private Project getProject(String name) {
        return projectRepository.findAll().stream()
                .filter(p -> p.getName().equals(name))
                .findFirst().orElse(null);
    }

    private void initializeTeams() {
        if (teamRepository.count() > 0) return;

        Project webProject = getProject("Store Website Revamp");
        Project invProject = getProject("Inventory Management System");

        User john = getUser("john.manager");
        User sarah = getUser("sarah.lead");
        User jenny = getUser("jenny.lead");
        User mike = getUser("mike.staff");
        User emily = getUser("emily.staff");
        User alex = getUser("alex.staff");
        User lisa = getUser("lisa.staff");
        User david = getUser("david.staff");

        Team frontend = new Team();
        frontend.setName("Frontend Team");
        frontend.setDescription("Handles all frontend development for web projects");
        frontend.setProject(webProject);
        frontend.setTeamLead(sarah);
        teamRepository.save(frontend);

        assignMembers(frontend, Arrays.asList(mike, alex));

        Team backend = new Team();
        backend.setName("Backend Team");
        backend.setDescription("Handles backend API and database development");
        backend.setProject(webProject);
        backend.setTeamLead(jenny);
        teamRepository.save(backend);

        assignMembers(backend, Arrays.asList());

        Team qaTeam = new Team();
        qaTeam.setName("QA Team");
        qaTeam.setDescription("Testing and quality assurance for all projects");
        qaTeam.setProject(webProject);
        qaTeam.setTeamLead(sarah);
        teamRepository.save(qaTeam);

        assignMembers(qaTeam, Arrays.asList(emily, lisa));

        Team inventory = new Team();
        inventory.setName("Inventory Team");
        inventory.setDescription("Inventory system development and maintenance");
        inventory.setProject(invProject);
        inventory.setTeamLead(jenny);
        teamRepository.save(inventory);

        assignMembers(inventory, Arrays.asList(david, mike));

        log.info("Created 4 teams");
    }

    private void assignMembers(Team team, List<User> members) {
        for (User member : members) {
            member.setTeam(team);
            userRepository.save(member);
        }
    }

    private Team getTeam(String name) {
        return teamRepository.findAll().stream()
                .filter(t -> t.getName().equals(name))
                .findFirst().orElse(null);
    }

    private void initializeTasks() {
        if (taskRepository.count() > 0) return;

        Team frontend = getTeam("Frontend Team");
        Team backend = getTeam("Backend Team");
        Team qaTeam = getTeam("QA Team");
        Team inventory = getTeam("Inventory Team");

        User sarah = getUser("sarah.lead");
        User jenny = getUser("jenny.lead");
        User mike = getUser("mike.staff");
        User emily = getUser("emily.staff");
        User david = getUser("david.staff");
        User admin = getUser("admin");
        User john = getUser("john.manager");

        Project web = getProject("Store Website Revamp");
        Project inv = getProject("Inventory Management System");

        createTask("Design new homepage layout", "Create wireframes and mockups for the new homepage", TaskStatus.COMPLETED, TaskPriority.HIGH, web, frontend, mike, admin, LocalDate.now().minusDays(30));
        createTask("Implement React components", "Build reusable React components", TaskStatus.IN_PROGRESS, TaskPriority.HIGH, web, frontend, mike, sarah, LocalDate.now().plusDays(5));
        createTask("Set up REST API endpoints", "Create API endpoints for user auth and data", TaskStatus.COMPLETED, TaskPriority.HIGH, web, backend, sarah, admin, LocalDate.now().minusDays(25));
        createTask("Database schema design", "Design and implement database schema", TaskStatus.COMPLETED, TaskPriority.MEDIUM, web, backend, jenny, admin, LocalDate.now().minusDays(35));
        createTask("Write unit tests", "Create unit tests for all components", TaskStatus.IN_REVIEW, TaskPriority.MEDIUM, web, qaTeam, emily, mike, LocalDate.now().plusDays(3));
        createTask("Integration testing", "Test API integration with frontend", TaskStatus.TESTING, TaskPriority.HIGH, web, qaTeam, emily, sarah, LocalDate.now().plusDays(7));
        createTask("Inventory database design", "Design database tables for inventory tracking", TaskStatus.IN_PROGRESS, TaskPriority.HIGH, inv, inventory, jenny, john, LocalDate.now().plusDays(10));
        createTask("Stock management API", "Build REST API for stock management", TaskStatus.TODO, TaskPriority.MEDIUM, inv, inventory, david, john, LocalDate.now().plusDays(20));

        log.info("Created 8 tasks");
    }

    private void createTask(String title, String description, TaskStatus status, TaskPriority priority,
                            Project project, Team team, User assignedTo, User createdBy, LocalDate dueDate) {
        Task task = new Task();
        task.setTitle(title);
        task.setDescription(description);
        task.setStatus(status);
        task.setPriority(priority);
        task.setProject(project);
        task.setTeam(team);
        task.setAssignedTo(assignedTo);
        task.setCreatedBy(createdBy);
        task.setDueDate(dueDate);
        taskRepository.save(task);
    }

    private void initializeChecklists() {
        if (checklistRepository.count() > 0) return;

        Team frontend = getTeam("Frontend Team");
        Team inventory = getTeam("Inventory Team");
        Shift morning = getShift(ShiftType.MORNING);
        Shift evening = getShift(ShiftType.EVENING);
        User sarah = getUser("sarah.lead");
        User jenny = getUser("jenny.lead");
        User mike = getUser("mike.staff");
        User emily = getUser("emily.staff");
        User david = getUser("david.staff");

        Checklist morningStore = new Checklist();
        morningStore.setTitle("Morning Shift Checklist - Store");
        morningStore.setDescription("Daily opening tasks for morning shift");
        morningStore.setShift(morning);
        morningStore.setTeam(frontend);
        morningStore.setCreatedBy(sarah);
        checklistRepository.save(morningStore);

        createChecklistItem("Check all entrances", "Verify all doors are unlocked and secure", false, morningStore, mike);
        createChecklistItem("Verify POS systems online", "Ensure all register systems are working", false, morningStore, mike);
        createChecklistItem("Team briefing", "Conduct morning team meeting", true, morningStore, sarah);

        Checklist eveningStore = new Checklist();
        eveningStore.setTitle("Evening Shift Checklist - Store");
        eveningStore.setDescription("Daily closing tasks for evening shift");
        eveningStore.setShift(evening);
        eveningStore.setTeam(frontend);
        eveningStore.setCreatedBy(sarah);
        checklistRepository.save(eveningStore);

        createChecklistItem("Cash reconciliation", "Count and reconcile daily receipts", false, eveningStore, mike);
        createChecklistItem("Clean and sanitize", "End-of-day cleaning tasks", false, eveningStore, emily);

        Checklist morningWarehouse = new Checklist();
        morningWarehouse.setTitle("Morning Shift Checklist - Warehouse");
        morningWarehouse.setDescription("Daily warehouse opening tasks");
        morningWarehouse.setShift(morning);
        morningWarehouse.setTeam(inventory);
        morningWarehouse.setCreatedBy(jenny);
        checklistRepository.save(morningWarehouse);

        createChecklistItem("Receive shipments", "Process incoming deliveries", false, morningWarehouse, david);
        createChecklistItem("Update inventory log", "Log all received items in the system", true, morningWarehouse, david);

        Checklist eveningWarehouse = new Checklist();
        eveningWarehouse.setTitle("Evening Shift Checklist - Warehouse");
        eveningWarehouse.setDescription("Daily warehouse closing tasks");
        eveningWarehouse.setShift(evening);
        eveningWarehouse.setTeam(inventory);
        eveningWarehouse.setCreatedBy(jenny);
        checklistRepository.save(eveningWarehouse);

        createChecklistItem("Stock count", "Count and verify stock levels for high-value items", false, eveningWarehouse, david);

        log.info("Created 4 checklists with 8 items");
    }

    private void createChecklistItem(String title, String description, boolean completed,
                                     Checklist checklist, User assignedTo) {
        ChecklistItem item = new ChecklistItem();
        item.setTitle(title);
        item.setDescription(description);
        item.setCompleted(completed);
        item.setChecklist(checklist);
        item.setAssignedTo(assignedTo);
        checklistItemRepository.save(item);
    }

    private void initializeHandovers() {
        if (handoverRepository.count() > 0) return;

        Shift evening = getShift(ShiftType.EVENING);
        Shift night = getShift(ShiftType.NIGHT);
        Shift morning = getShift(ShiftType.MORNING);
        Team frontend = getTeam("Frontend Team");
        Team inventory = getTeam("Inventory Team");

        User mike = getUser("mike.staff");
        User alex = getUser("alex.staff");
        User sarah = getUser("sarah.lead");

        createHandover("Evening to Night Handover",
                "Completed all evening POS closing. Processed 150 transactions.",
                "Complete inventory count for section B. Review pending support tickets.",
                "Waiting for vendor delivery - shelf restocking pending.",
                "Check delivery status. Section B count if time permits.",
                evening, night, frontend, inventory, mike, false, false);

        createHandover("Night to Morning Handover",
                "Completed security rounds. Verified all systems offline.",
                "Morning team to unlock and activate POS systems.",
                null,
                "All clear for morning. Restock coffee supplies.",
                night, morning, inventory, frontend, alex, false, false);

        createHandover("Morning to Evening Handover",
                "Opened store on time. Processed 120 transactions before noon.",
                "Evening team to complete end-of-day reconciliation.",
                "One shelf needs restocking - running low on popular items.",
                "Restock from back room. Complete close by 10pm.",
                morning, evening, frontend, frontend, sarah, true, true);

        log.info("Created 3 handovers");
    }

    private void createHandover(String title, String completedWork, String pendingWork, String blockers,
                                String instructions, Shift fromShift, Shift toShift,
                                Team assignedTeam, Team receivingTeam, User createdBy,
                                boolean resolved, boolean acknowledged) {
        Handover handover = new Handover();
        handover.setTitle(title);
        handover.setCompletedWork(completedWork);
        handover.setPendingWork(pendingWork);
        handover.setBlockers(blockers);
        handover.setNextShiftInstructions(instructions);
        handover.setFromShift(fromShift);
        handover.setToShift(toShift);
        handover.setAssignedTeam(assignedTeam);
        handover.setReceivingTeam(receivingTeam);
        handover.setPriority(HandoverPriority.MEDIUM);
        handover.setCreatedBy(createdBy);
        handover.setResolved(resolved);
        if (acknowledged) {
            handover.setAcknowledged(true);
            handover.setAcknowledgedAt(LocalDateTime.now());
        }
        handoverRepository.save(handover);
    }
}
