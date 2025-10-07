// src/main/java/com/nangnaidee/backend/model/Location.java

package com.nangnaidee.backend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "locations", schema = "dbo") // <- แนะนำให้ระบุ schema ให้ตรง DB
public class Location {

    @Id
    @Column(name = "id", columnDefinition = "uniqueidentifier")
    @EqualsAndHashCode.Include
    @ToString.Include
    private UUID id; // ถ้าไม่ส่งมา เราจะ gen เองใน @PrePersist

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)  // FK -> users.id (INT)
    private User owner;

    @Column(name = "name", nullable = false, length = 200)
    @ToString.Include
    private String name;

    @Column(name = "description")
    private String description;

    @Column(name = "address_text", length = 500)
    private String addressText;

    @Column(name = "geo_lat")
    private Double geoLat;

    @Column(name = "geo_lng")
    private Double geoLng;

    @Column(name = "cover_image_url", length = 600)
    private String coverImageUrl;

    // ✅ เพิ่มฟิลด์ publicId ไว้จัดการรูป (ลบ/แปลง) ได้ง่าย
    @Column(name = "cover_image_public_id", length = 300)
    private String coverImagePublicId;

    @Column(name = "is_active", nullable = false)
    private boolean isActive = true;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    // ✅ เผื่อกรณีไม่ได้เซ็ต id มาจาก service
    @PrePersist
    public void prePersist() {
        if (id == null) id = UUID.randomUUID();
    }
}
