// backend/src/main/java/com/nangnaidee/backend/dto/CreateHostUnitRequest.java

package com.nangnaidee.backend.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateHostUnitRequest {

    @NotBlank(message = "code ต้องไม่ว่าง")
    @Size(max = 100, message = "code ต้องไม่เกิน 100 ตัวอักษร")
    private String code;

    @Size(max = 200, message = "name ต้องไม่เกิน 200 ตัวอักษร")
    private String name;

    @Size(max = 600, message = "imageUrl ต้องไม่เกิน 600 ตัวอักษร")
    private String imageUrl;

    @Size(max = 300, message = "shortDesc ต้องไม่เกิน 300 ตัวอักษร")
    private String shortDesc;

    @Min(value = 1, message = "capacity ต้องมากกว่าหรือเท่ากับ 1")
    @NotNull(message = "capacity ต้องไม่เป็น null")
    private Integer capacity;

    @DecimalMin(value = "0.01", message = "priceHourly ต้องมากกว่า 0")
    @NotNull(message = "priceHourly ต้องไม่เป็น null")
    private BigDecimal priceHourly;
}
//อันนี้จะเป็น Request ที่ใช้ในการสร้างหน่วยที่พัก (Host Unit) ใหม่ โดยเรามีการตรวจสอบความถูกต้องของข้อมูลที่ส่งเข้ามาก่อน
