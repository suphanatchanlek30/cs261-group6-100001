package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PatchUserStatusResponse {
    private String status; // "SUSPENDED" or "ACTIVE"
}