package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
public class AvailableUnitItem {
    private UUID unitId;
    private String unitCode;
    private String unitName;
    private String unitImageUrl;
    private String unitShortDesc;
    private int capacity;
    private BigDecimal priceHourly;
    
    // Location info
    private UUID locationId;
    private String locationName;
    private String locationAddress;
    private Double locationLat;
    private Double locationLng;
    private String locationCoverImageUrl;
    
    // Distance info (if searching by location)
    private Double distanceKm;
}