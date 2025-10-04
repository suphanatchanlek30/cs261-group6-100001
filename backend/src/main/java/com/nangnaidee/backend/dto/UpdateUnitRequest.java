package com.nangnaidee.backend.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class UpdateUnitRequest {

    @Size(max = 200, message = "ชื่อตาราง/ยูนิตยาวเกินกำหนด (สูงสุด 200)")
    private String name;

    @Size(max = 600, message = "ลิงก์รูปภาพยาวเกินกำหนด (สูงสุด 600)")
    private String imageUrl;

    @Size(max = 300, message = "คำอธิบายสั้นยาวเกินกำหนด (สูงสุด 300)")
    private String shortDesc;

    @Min(value = 1, message = "ความจุต้องตั้งแต่ 1 ขึ้นไป")
    private Integer capacity;

    @DecimalMin(value = "0.01", inclusive = true, message = "ราคา/ชั่วโมงต้องมากกว่า 0")
    private BigDecimal priceHourly;

    private Boolean isActive;
}