package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class AvailabilitySearchResponse {
    private List<AvailableUnitItem> items;
    private int page;
    private int size;
    private long total;
}