// backend/src/main/java/com/nangnaidee/backend/dto/CreateUnitBlockRequest.java

package com.nangnaidee.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateUnitBlockRequest {
    
    @NotBlank(message = "start time ต้องไม่ว่าง")
    private String start;
    
    @NotBlank(message = "end time ต้องไม่ว่าง")
    private String end;
    
    @Size(max = 500, message = "reason ต้องไม่เกิน 500 ตัวอักษร")
    private String reason;
}