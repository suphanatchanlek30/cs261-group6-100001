// src/main/java/com/nangnaidee/backend/dto/PatchPaymentRequest.java

package com.nangnaidee.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;


@Data
public class PatchPaymentRequest {

    @NotNull(message = "กรุณาอนุมัติหรือปฏิเสธ")
    private String status;
    
}
