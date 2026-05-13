package com.store.taskmanager.dto;

import com.store.taskmanager.entity.enums.Role;
import com.store.taskmanager.entity.enums.UserStatus;
import lombok.Data;

@Data
public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Role role;
    private UserStatus status;
    private Long teamId;
    private Long shiftId;
}
