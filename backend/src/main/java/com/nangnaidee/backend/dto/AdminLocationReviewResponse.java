// backend/src/main/java/com/nangnaidee/backend/dto/AdminLocationReviewResponse.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminLocationReviewResponse {
    private String publishStatus;
    private String reason;
}