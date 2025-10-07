// src/main/java/com/nangnaidee/backend/dto/GetPaymentItemDto.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class GetPaymentItemDto {
    private UUID paymentId;
    private UUID bookingId;
    private String method;
    private BigDecimal amount;
    private String status;
    private String proofUrl;
    private Integer reviewedBy; // แทน UUID
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
}
