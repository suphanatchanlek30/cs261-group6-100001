// src/main/java/com/nangnaidee/backend/model/Payment.java

package com.nangnaidee.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "payments", schema = "dbo")
public class Payment {

    @Id
    @GeneratedValue
    private UUID id; // Hibernate จะ generate id เอง

    @OneToOne
    @JoinColumn(name = "booking_id", nullable = false, unique = true)
    private Booking booking; // เชื่อมกับ Booking entity

    @Column(nullable = false, length = 30, columnDefinition = "NVARCHAR(30)")
    private String method = "QR";

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    @Column(name = "proof_url", length = 600, columnDefinition = "NVARCHAR(600)")
    private String proofUrl;

    @Column(nullable = false, length = 20, columnDefinition = "NVARCHAR(20)")
    private String status = "PENDING";

    @ManyToOne
    @JoinColumn(name = "reviewed_by")
    private User reviewedBy;

    @Column(name = "reviewed_at")
    private LocalDateTime reviewedAt;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
