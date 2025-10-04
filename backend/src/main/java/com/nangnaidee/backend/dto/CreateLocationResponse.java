// src/main/java/com/nangnaidee/backend/dto/CreateLocationResponse.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class CreateLocationResponse {
    private UUID id;
}