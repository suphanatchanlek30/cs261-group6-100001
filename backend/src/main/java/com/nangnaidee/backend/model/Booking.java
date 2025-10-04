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
    // ไม่ต้องใส่ฟิลด์อื่นๆ ก็ได้ เพราะเราใช้แค่นับ (COUNT)
}