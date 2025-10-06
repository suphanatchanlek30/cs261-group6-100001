// src/main/java/com/nangnaidee/backend/model/Booking.java

package com.nangnaidee.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "bookings", schema = "dbo")
public class Booking {
    @Id
    @Column(name = "id", columnDefinition = "uniqueidentifier")
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "location_unit_id", columnDefinition = "uniqueidentifier", nullable = false)
    private UUID locationUnitId;

    @Column(name = "start_time", nullable = false)
    private java.time.LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private java.time.LocalDateTime endTime;

    @Column(name = "hours", nullable = false)
    private int hours;

    @Column(name = "total", nullable = false, precision = 10, scale = 2)
    private java.math.BigDecimal total;

    @Column(name = "status", nullable = false, length = 20)
    private String status;

    @Column(name = "booking_code", length = 32)
    private String bookingCode;

    @Column(name = "created_at", nullable = false)
    private java.time.LocalDateTime createdAt;
}