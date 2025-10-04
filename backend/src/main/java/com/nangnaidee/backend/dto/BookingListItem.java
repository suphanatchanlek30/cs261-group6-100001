package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class BookingListItem {
    private UUID id;
    private UUID locationUnitId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int hours;
    private BigDecimal total;
    private String status;
    private String bookingCode;
    private LocalDateTime createdAt;
}