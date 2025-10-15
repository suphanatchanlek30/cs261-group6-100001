// src/main/java/com/nangnaidee/backend/dto/AdminReviewListResponse.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data @AllArgsConstructor
public class AdminReviewListResponse {
    private List<AdminReviewListItem> items;
    private int page;
    private int size;
    private long total;
    private int totalPages;
}