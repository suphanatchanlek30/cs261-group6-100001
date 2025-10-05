package com.nangnaidee.backend.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;


@Data
public class PatchPaymentRequest {

    @NotNull(message = "กรุณาอนุมัติหรือปฏิเสธ")
    private String status;
    
}
