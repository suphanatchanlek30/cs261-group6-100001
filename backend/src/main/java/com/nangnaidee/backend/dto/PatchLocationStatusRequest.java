package com.nangnaidee.backend.dto;

import lombok.Data;

@Data
public class PatchLocationStatusRequest {
    private Boolean isActive;
    private String reason;  // optional
}