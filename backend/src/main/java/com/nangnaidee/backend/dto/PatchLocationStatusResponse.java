package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class PatchLocationStatusResponse {
    private UUID id;
    private Boolean isActive;
    private String reason;
}