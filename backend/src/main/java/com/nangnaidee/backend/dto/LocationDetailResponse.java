// src/main/java/com/nangnaidee/backend/dto/LocationDetailResponse.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
public class LocationDetailResponse {
    private UUID id;
    private Integer ownerId;
    private String name;
    private String description;
    private String address;
    private Double geoLat;
    private Double geoLng;
    private String coverImageUrl;
    private boolean isActive;
    private LocalDateTime createdAt;
    private List<UnitItem> units;

    @Data
    @AllArgsConstructor
    public static class UnitItem {
        private UUID id;
        private String code;
        private String name;
        private String imageUrl;
        private String shortDesc;
        private int capacity;
        private BigDecimal priceHourly;
        private boolean isActive;
    }
}
