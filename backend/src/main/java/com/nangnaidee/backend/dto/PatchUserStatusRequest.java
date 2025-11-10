package com.nangnaidee.backend.dto;

import lombok.Data;

@Data
public class PatchUserStatusRequest {
    private String status; // "SUSPENDED" or "ACTIVE"
    private String reason; // optional
}