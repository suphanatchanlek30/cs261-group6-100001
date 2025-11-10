// backend/src/main/java/com/nangnaidee/backend/dto/AdminLocationReviewRequest.java

package com.nangnaidee.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminLocationReviewRequest {
    
    @NotBlank(message = "status ต้องไม่ว่าง")
    @Pattern(regexp = "APPROVED|REJECTED", message = "status ต้องเป็น APPROVED หรือ REJECTED")
    private String status;
    
    private String reason; // Optional - ใช้เมื่อ REJECTED
}