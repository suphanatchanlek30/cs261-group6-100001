// src/main/java/com/nangnaidee/backend/dto/CreateUnitResponse.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class CreateUnitResponse {
    private String message;
    private UUID id;
}
