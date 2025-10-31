// src/main/java/com/nangnaidee/backend/dto/BookingOverviewItem.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;
import lombok.*;

@Data
@AllArgsConstructor
public class BookingOverviewItem {

    @Data @AllArgsConstructor
    public static class BookingDto {
        private UUID id;
        private String status;
        private String bookingCode;
        private OffsetDateTime startTime; // UTC (Z)
        private OffsetDateTime endTime;   // UTC (Z)
        private int hours;
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
    }

    @Data @AllArgsConstructor
    public static class PaymentDto {
        private UUID paymentId;
        private String status;
        private String proofUrl;
    }

    @Data @AllArgsConstructor
    public static class ReviewDto {
        private boolean canReview;
        private UUID reviewId;       // ถ้ามีรีวิวแล้ว
        private Double avgRating;    // อาจเป็น null
        private Long ratingCount;    // อาจเป็น null
    }

    @Data @AllArgsConstructor
    public static class Actions {
        private boolean canPay;
        private boolean canCancel;
        private boolean canUploadProof;
    }

    private BookingDto booking;
    private UnitDto unit;
    private LocationDto location;
    private PaymentDto payment;
    private ReviewDto review;
    private Actions actions;

    // helper สั้น ๆ สำหรับแปลง LocalDateTime -> OffsetDateTime (UTC)
    public static OffsetDateTime utc(LocalDateTime t) {
        return t == null ? null : OffsetDateTime.of(t, ZoneOffset.UTC);
    }
}
