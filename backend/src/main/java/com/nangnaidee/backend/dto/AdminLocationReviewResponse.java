// backend/src/main/java/com/nangnaidee/backend/dto/AdminLocationReviewResponse.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminLocationReviewResponse {
    private UUID id;
    private String publishStatus;
    private String reason;
}