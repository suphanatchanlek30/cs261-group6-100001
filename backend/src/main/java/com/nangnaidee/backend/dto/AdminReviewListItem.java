// src/main/java/com/nangnaidee/backend/dto/AdminReviewListItem.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data @AllArgsConstructor
public class AdminReviewListItem {
    private UUID reviewId;
    private UUID bookingId;

    // reviewer
    private Integer userId;
    private String userName;

    // review
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;

    // location
    private UUID locationId;
    private String locationName;
    private String locationCoverImageUrl;
}
