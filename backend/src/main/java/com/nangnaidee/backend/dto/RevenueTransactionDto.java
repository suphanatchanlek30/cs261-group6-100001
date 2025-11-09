package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RevenueTransactionDto {
    private UUID bookingId;
    private UUID paymentId;
    private BigDecimal amount;
    private String method;
    private LocalDateTime approvedAt;
    private String locationName;
}