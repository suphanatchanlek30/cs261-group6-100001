package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PatchUserStatusResponse {
    private Integer userId;
    private String email;
    private String fullName;
    private String status; // "SUSPENDED" or "ACTIVE"
    private String message;
}