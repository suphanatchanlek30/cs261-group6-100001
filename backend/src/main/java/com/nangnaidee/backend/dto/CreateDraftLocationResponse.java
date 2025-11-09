// backend/src/main/java/com/nangnaidee/backend/dto/CreateDraftLocationResponse.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class CreateDraftLocationResponse {
    private UUID id;
    private String publishStatus;
}