package com.nangnaidee.backend.dto;

import lombok.Data;
import lombok.Builder;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@Builder
public class HostRevenueSummaryResponse {
    private LocalDateTime date;
    private BigDecimal totalRevenue;
    private Integer totalBookings;
}
