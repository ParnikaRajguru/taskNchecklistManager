package com.store.taskmanager.config;

import com.store.taskmanager.entity.Shift;
import com.store.taskmanager.entity.User;
import com.store.taskmanager.entity.enums.Role;
import com.store.taskmanager.entity.enums.ShiftType;
import com.store.taskmanager.repository.ShiftRepository;
import com.store.taskmanager.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalTime;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final ShiftRepository shiftRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) throws Exception {
        initializeShifts();
        initializeDefaultAdmin();
    }
    
    private void initializeShifts() {
        if (shiftRepository.count() == 0) {
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
            
            System.out.println("Default shifts created");
        }
    }
    
    private void initializeDefaultAdmin() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setFirstName("System");
            admin.setLastName("Administrator");
            admin.setEmail("admin@store.com");
            admin.setRole(Role.SUPER_ADMIN);
            admin.setActive(true);
            admin.setFirstLogin(false);
            userRepository.save(admin);
            
            System.out.println("Default admin user created - Username: admin, Password: admin123");
        }
        
        initializeSampleUsers();
    }
    
    private void initializeSampleUsers() {
        if (userRepository.count() <= 1) {
            createSampleUser("john.manager", "password123", "John", "Smith", "john@store.com", Role.MANAGER);
            createSampleUser("sarah.lead", "password123", "Sarah", "Johnson", "sarah@store.com", Role.TEAM_LEAD);
            createSampleUser("mike.dev", "password123", "Mike", "Davis", "mike@store.com", Role.DEVELOPER);
            createSampleUser("emily.tester", "password123", "Emily", "Brown", "emily@store.com", Role.TESTER);
            createSampleUser("alex.dev", "password123", "Alex", "Wilson", "alex@store.com", Role.DEVELOPER);
            createSampleUser("lisa.tester", "password123", "Lisa", "Martinez", "lisa@store.com", Role.TESTER);
            createSampleUser("david.dev", "password123", "David", "Anderson", "david@store.com", Role.DEVELOPER);
            createSampleUser("jenny.lead", "password123", "Jenny", "Taylor", "jenny@store.com", Role.TEAM_LEAD);
            
            System.out.println("Sample users created with password: password123");
        }
    }
    
    private void createSampleUser(String username, String password, String firstName, String lastName, String email, Role role) {
        if (!userRepository.existsByUsername(username)) {
            User user = new User();
            user.setUsername(username);
            user.setPassword(passwordEncoder.encode(password));
            user.setFirstName(firstName);
            user.setLastName(lastName);
            user.setEmail(email);
            user.setRole(role);
            user.setActive(true);
            user.setFirstLogin(false);
            userRepository.save(user);
        }
    }
}