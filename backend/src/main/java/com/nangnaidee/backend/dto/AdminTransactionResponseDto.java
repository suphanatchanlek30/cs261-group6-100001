package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class AdminTransactionResponseDto {
    private UUID bookingId;
    private String bookingStatus;
    private UUID paymentId;
    private String paymentStatus;
    private BigDecimal amount;
    private Integer hostId;
    private String locationName;
    private LocalDateTime createdAt;
}
