package com.nangnaidee.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.util.UUID;

@Data
public class CreatePaymentRequest {

    @NotNull(message = "กรุณาระบุ bookingId")
    private UUID bookingId;  // ตรงกับ "bookingId" ใน JSON

    @NotBlank(message = "กรุณาระบุ method การชำระ")
    @Size(max = 30, message = "method ยาวเกิน 30 ตัวอักษร")
    private String method;   // ตรงกับ "method" ใน JSON
}
