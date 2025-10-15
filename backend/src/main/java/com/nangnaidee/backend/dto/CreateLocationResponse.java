// src/main/java/com/nangnaidee/backend/dto/CreateLocationResponse.java

package com.nangnaidee.backend.dto;

import com.fasterxml.jackson.annotation.JsonPropertyOrder;
import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
@JsonPropertyOrder({"message", "id"})
public class CreateLocationResponse {
    private String message;
    private UUID id;
}