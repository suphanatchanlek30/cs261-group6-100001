package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
public class UpdateUnitResponse {
    private UUID id;
    private String code;
    private String name;
    private String imageUrl;
    private String shortDesc;
    private int capacity;
    private BigDecimal priceHourly;
    private boolean isActive;
}