// src/main/java/com/nangnaidee/backend/dto/LocationListResponse.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class LocationListResponse {
    private List<LocationListItem> items;
    private int page;
    private int size;
    private long total;
}
