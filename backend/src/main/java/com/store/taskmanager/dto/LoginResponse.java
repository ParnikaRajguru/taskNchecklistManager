package com.store.taskmanager.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String username;
    private String firstName;
    private String lastName;
    private String email;
    private String role;
    private Long teamId;
    private Long shiftId;
    private boolean firstLogin;
}