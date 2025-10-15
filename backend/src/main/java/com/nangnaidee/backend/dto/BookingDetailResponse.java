// src/main/java/com/nangnaidee/backend/dto/BookingDetailResponse.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
public class BookingDetailResponse {

    private BookingDto booking;
    private UnitDto unit;
    private LocationDto location;
    private PaymentDto payment;
    private ReviewDto review;
    private Actions actions;

    @Data @AllArgsConstructor
    public static class BookingDto {
        private UUID id;
        private String status;         // HOLD|PENDING_REVIEW|CONFIRMED|CANCELLED
        private String bookingCode;
        private OffsetDateTime startTime; // คืนเป็น UTC (Z)
        private OffsetDateTime endTime;
        private Integer hours;
        private BigDecimal total;
    }

    @Data @AllArgsConstructor
    public static class UnitDto {
        private UUID id;
        private String code;
        private String name;
        private String imageUrl;
        private Integer capacity;
        private String shortDesc;
    }

    @Data @AllArgsConstructor
    public static class LocationDto {
        private UUID id;
        private String name;
        private String address;
        private Double lat;
        private Double lng;
        private String coverImageUrl;
        private Double avgRating;   // อาจเป็น null
        private Long reviewCount;   // อาจเป็น null
    }

    @Data @AllArgsConstructor
    public static class PaymentDto {
        private UUID id;           // อาจเป็น null
        private String status;     // PENDING|APPROVED|REJECTED|null
        private String proofUrl;   // อาจเป็น null
    }

    @Data @AllArgsConstructor
    public static class ReviewDto {
        private boolean canWrite;  // จบเวลาแล้ว + CONFIRMED + ยังไม่มีรีวิว
        private UUID reviewId;     // ถ้าเคยรีวิวแล้ว (id)
    }

    @Data @AllArgsConstructor
    public static class Actions {
        private boolean canCancel;  // HOLD เท่านั้น
        private boolean canPay;     // HOLD หรือ PENDING_REVIEW
        private boolean canUploadSlip; // มี payment และยัง PENDING และไม่มี proofUrl
    }
}
