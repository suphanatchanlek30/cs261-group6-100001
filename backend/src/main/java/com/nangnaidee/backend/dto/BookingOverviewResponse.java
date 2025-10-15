// src/main/java/com/nangnaidee/backend/dto/BookingOverviewResponse.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class BookingOverviewResponse {
    private List<BookingOverviewItem> items;
    private int page;
    private int size;
    private long total;
    private int totalPages;
}
