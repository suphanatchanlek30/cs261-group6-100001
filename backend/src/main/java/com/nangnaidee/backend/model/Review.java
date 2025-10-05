package com.nangnaidee.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "reviews", schema = "dbo")
public class Review {
    
    @Id
    @Column(name = "id", columnDefinition = "uniqueidentifier")
    @EqualsAndHashCode.Include
    private UUID id;

    @Column(name = "booking_id", columnDefinition = "uniqueidentifier", nullable = false, unique = true)
    private UUID bookingId;

    @Column(name = "location_id", columnDefinition = "uniqueidentifier", nullable = false)
    private UUID locationId;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "comment", columnDefinition = "NVARCHAR(1000)")
    private String comment;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
}