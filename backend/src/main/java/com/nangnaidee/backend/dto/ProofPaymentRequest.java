// src/main/java/com/nangnaidee/backend/dto/ProofPaymentRequest.java

package com.nangnaidee.backend.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;


@Data
public class ProofPaymentRequest {
    @NotBlank(message = "กรุณาระบุ URL ของสลิปการโอนเงิน")
    private String proofUrl; 
}
