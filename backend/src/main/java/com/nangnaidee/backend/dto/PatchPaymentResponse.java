package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.UUID;

@Data
@AllArgsConstructor
public class PatchPaymentResponse {

    private String paymentStatus;
    private String bookingStatus;
    private UUID bookingId;
    private String bookingCode;
}
