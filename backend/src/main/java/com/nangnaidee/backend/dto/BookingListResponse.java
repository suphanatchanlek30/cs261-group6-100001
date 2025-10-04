package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class BookingListResponse {
    private List<BookingListItem> items;
    private int page;
    private int size;
    private long total;
    private int totalPages;
}