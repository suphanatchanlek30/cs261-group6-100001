// backend/src/main/java/com/nangnaidee/backend/dto/CreateLocationBlockResponse.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateLocationBlockResponse {
    private UUID blockId;
}