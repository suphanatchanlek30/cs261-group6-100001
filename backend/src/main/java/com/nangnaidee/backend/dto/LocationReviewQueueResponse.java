// backend/src/main/java/com/nangnaidee/backend/dto/LocationReviewQueueResponse.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
public class LocationReviewQueueResponse {
    private List<LocationReviewItem> items;
    private int totalElements;
    private int totalPages;
    private int currentPage;
    private int pageSize;

    @Data
    @AllArgsConstructor
    public static class LocationReviewItem {
        private UUID id;
        private String name;
        private Integer ownerId;
        private LocalDateTime submittedAt;
    }
}