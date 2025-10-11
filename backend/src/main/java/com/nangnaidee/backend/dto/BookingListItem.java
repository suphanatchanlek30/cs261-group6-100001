// src/main/java/com/nangnaidee/backend/dto/BookingListItem.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class BookingListItem {
    private UUID id;
    private UUID locationUnitId;
//    private LocalDateTime startTime;
//    private LocalDateTime endTime;
    private int hours;
    private BigDecimal total;
    private String status;
    private String bookingCode;
    private LocalDateTime createdAt;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;

    public BookingListItem(UUID id, UUID locationUnitId, OffsetDateTime of, OffsetDateTime of1, int hours, BigDecimal total, String status, String bookingCode, LocalDateTime createdAt) {
    }
}