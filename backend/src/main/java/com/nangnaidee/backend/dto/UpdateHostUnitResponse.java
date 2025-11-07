// backend/src/main/java/com/nangnaidee/backend/dto/UpdateHostUnitResponse.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateHostUnitResponse {
    private UUID id;
    private String code;
    private String name;
    private String imageUrl;
    private String shortDesc;
    private Integer capacity;
    private BigDecimal priceHourly;
    private Boolean isActive;
    private String publishStatus;
} //โค้ดตัวนี้มีไว้สําหรับการ ตอบกลับซึ่งตอบกลับข้อมูลของ unit ที่ได้รับการอัปเดตทั้งหมด