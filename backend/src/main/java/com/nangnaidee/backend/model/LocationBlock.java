// backend/src/main/java/com/nangnaidee/backend/model/LocationBlock.java

package com.nangnaidee.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "location_blocks", schema = "dbo")
public class LocationBlock {

    @Id
    @Column(name = "id", columnDefinition = "uniqueidentifier")
    @EqualsAndHashCode.Include
    @ToString.Include
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(name = "location_id", nullable = false, insertable = false, updatable = false)
    private UUID locationId;

    @Column(name = "start_time", nullable = false)
    @ToString.Include
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    @ToString.Include
    private LocalDateTime endTime;

    @Column(name = "reason", length = 500, columnDefinition = "NVARCHAR(500)")
    private String reason;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
    //โค้ดตัวนี้เป็นโมเดลของ LocationBlock ซึ่งใช้เก็บข้อมูลเกี่ยวกับช่วงเวลาที่ถูกบล็อกในสถานที่หนึ่งๆ โดยมีฟิลด์ต่างๆ เช่น id, locationId, startTime, endTime, reason และ createdAt
}