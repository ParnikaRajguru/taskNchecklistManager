package com.store.taskmanager.dto;

import com.store.taskmanager.entity.enums.Role;
import lombok.Data;

@Data
public class UpdateUserRequest {
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private Role role;
    private Long teamId;
    private Long shiftId;
}
