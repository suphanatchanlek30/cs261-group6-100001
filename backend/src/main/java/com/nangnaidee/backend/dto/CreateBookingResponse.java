package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class CreateBookingResponse {
    private UUID id;
    private UUID unitId;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private int hours;
    private BigDecimal total;
    private String status;
}