// src/main/java/com/nangnaidee/backend/dto/LocationReviewsOverviewResponse.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data @AllArgsConstructor @NoArgsConstructor
public class LocationReviewsOverviewResponse {
    private List<ReviewListItem> items; // รายการรีวิว (เพจ)
    private int page;
    private int size;
    private long total;
    private int totalPages;

    private RatingStats stats;  // ✅ สถิติรีวิวรวม
}
