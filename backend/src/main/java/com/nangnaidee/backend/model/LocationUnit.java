// src/main/java/com/nangnaidee/backend/model/LocationUnit.java
package com.nangnaidee.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "location_units", schema = "dbo") // ✅ แนะนำให้ระบุ schema
public class LocationUnit {

    @Id
    @Column(name = "id", columnDefinition = "uniqueidentifier")
    @EqualsAndHashCode.Include
    @ToString.Include
    private UUID id; // ถ้าไม่ได้เซ็ต จะ gen ใน @PrePersist

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    @ToString.Exclude
    private Location location;

    @Column(name = "code", nullable = false, length = 100)
    @ToString.Include
    private String code;

    @Column(name = "name", length = 200)
    private String name;

    @Column(name = "image_url", length = 600)
    private String imageUrl;

    // ✅ เก็บ publicId ของ Cloudinary
    @Column(name = "image_public_id", length = 300)
    private String imagePublicId;

    @Column(name = "short_desc", length = 300)
    private String shortDesc;

    @Column(name = "capacity", nullable = false)
    private int capacity;

    @Column(name = "price_hourly", nullable = false, precision = 10, scale = 2)
    private BigDecimal priceHourly;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
    }
}
