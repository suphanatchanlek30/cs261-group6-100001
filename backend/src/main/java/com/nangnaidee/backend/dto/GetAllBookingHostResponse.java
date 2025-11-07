package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetAllBookingHostResponse {
    private UUID bookingId;
    private String bookingCode;
    private String status;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int hours;
    private BigDecimal total;
    
    private UUID unitId;
    private String unitCode;
    private String unitName;
    
    private UUID locationId;
    private String locationName;
    
    private UUID paymentId;
    private String paymentStatus;
    
    private UUID reviewId;
    private Double avgRating;
    private Integer cntRating;
}
