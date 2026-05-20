package com.store.taskmanager.dto;

import com.store.taskmanager.entity.enums.Role;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class UserDTO {
    private Long id;
    private String publicId;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Role role;
    private Long teamId;
    private String teamName;
    private Long shiftId;
    private String shiftName;
    private boolean firstLogin;
    private LocalDateTime createdAt;
}
