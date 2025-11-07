// backend/src/main/java/com/nangnaidee/backend/dto/UpdateHostUnitRequest.java

package com.nangnaidee.backend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateHostUnitRequest {

    @Size(max = 100, message = "code ต้องไม่เกิน 100 ตัวอักษร")
    private String code;

    @Size(max = 200, message = "name ต้องไม่เกิน 200 ตัวอักษร")
    private String name;

    @Size(max = 600, message = "imageUrl ต้องไม่เกิน 600 ตัวอักษร")
    private String imageUrl;

    @Size(max = 300, message = "shortDesc ต้องไม่เกิน 300 ตัวอักษร")
    private String shortDesc;

    @Min(value = 1, message = "capacity ต้องมากกว่าหรือเท่ากับ 1")
    private Integer capacity;

    @DecimalMin(value = "0.01", message = "priceHourly ต้องมากกว่า 0")
    private BigDecimal priceHourly;

    private Boolean isActive;
    //อันนี้เป็น Request ที่ใช้ในการอัปเดตข้อมูลของหน่วยที่พัก (Host Unit) โดยมีการตรวจสอบความถูกต้องของข้อมูลที่ส่งเข้ามาเช่นเดียวกับ CreateHostUnitRequest
}