// src/main/java/com/nangnaidee/backend/dto/CreateBookingRequest.java

package com.nangnaidee.backend.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class CreateBookingRequest {
    @NotNull(message = "กรุณาระบุ unitId")
    private UUID unitId;

    @NotNull(message = "กรุณาระบุ startTime")
    private OffsetDateTime startTime;

    @Min(value = 1, message = "hours ต้องอย่างน้อย 1")
    private int hours;
}