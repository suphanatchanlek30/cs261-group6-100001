// src/main/java/com/nangnaidee/backend/dto/CreatePaymentResponse.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
public class CreatePaymentResponse {

    private UUID paymentId;      // ID ของ Payment
    private String status;       // สถานะ เช่น PENDING, PAID
    private BigDecimal amount;   // จำนวนเงิน
}
