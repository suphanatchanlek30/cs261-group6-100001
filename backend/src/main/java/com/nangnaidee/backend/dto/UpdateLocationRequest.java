// src/main/java/com/nangnaidee/backend/dto/UpdateLocationRequest.java

package com.nangnaidee.backend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdateLocationRequest {
    @Size(max = 200, message = "ชื่อสถานที่ยาวเกินกำหนด (สูงสุด 200)")
    private String name;

    @Size(max = 2000, message = "คำอธิบายยาวเกินกำหนด")
    private String description;

    @Size(max = 500, message = "ที่อยู่ยาวเกินกำหนด")
    private String address;

    @DecimalMin(value = "-90.0",  message = "ละติจูดต้องอยู่ระหว่าง -90 ถึง 90")
    @DecimalMax(value = "90.0",   message = "ละติจูดต้องอยู่ระหว่าง -90 ถึง 90")
    private Double geoLat;

    @DecimalMin(value = "-180.0", message = "ลองจิจูดต้องอยู่ระหว่าง -180 ถึง 180")
    @DecimalMax(value = "180.0",  message = "ลองจิจูดต้องอยู่ระหว่าง -180 ถึง 180")
    private Double geoLng;

    @Size(max = 600, message = "URL รูปภาพยาวเกินกำหนด")
    private String coverImageUrl;

    // เปิด/ปิดสถานที่
    private Boolean isActive;
}