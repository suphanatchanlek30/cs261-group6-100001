// backend/src/main/java/com/nangnaidee/backend/dto/HostLocationDetailResponse.java

package com.nangnaidee.backend.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL) // ทำให้ฟิลด์ที่เป็น null (เช่น rejectReason) หายไปจาก JSON
public class HostLocationDetailResponse {

    private UUID id;
    private String name;
    private String description;
    private String address;
    private Double geoLat;
    private Double geoLng;
    private String coverImageUrl;
    private LocalDateTime createdAt;

    // ฟิลด์สถานะที่เพิ่มเข้ามา
    private String publishStatus; // "DRAFT", "APPROVED", "REJECTED"
    private String rejectReason;  // จะเป็น null ถ้าไม่ถูก REJECTED
    private boolean isActive;     // (คงไว้เผื่อ Frontend ใช้งาน)

    // รายการยูนิต (เหมือน LocationDetailResponse)
    private List<UnitItem> units;

    // Inner class สำหรับ UnitItem
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UnitItem {
        private UUID id;
        private String code;
        private String name;
        private String imageUrl;
        private String shortDesc;
        private int capacity;
        private BigDecimal priceHourly;
        private boolean isActive;
    }
}