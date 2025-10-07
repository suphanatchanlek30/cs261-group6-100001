// src/main/java/com/nangnaidee/backend/dto/CancelBookingRequest.java

package com.nangnaidee.backend.dto;

import jakarta.validation.constraints.Size;

/**
 * Request DTO for booking cancellation
 */
public class CancelBookingRequest {
    
    @Size(max = 500, message = "เหตุผลต้องไม่เกิน 500 ตัวอักษร")
    private String reason;
    
    public CancelBookingRequest() {}
    
    public CancelBookingRequest(String reason) {
        this.reason = reason;
    }
    
    public String getReason() {
        return reason;
    }
    
    public void setReason(String reason) {
        this.reason = reason;
    }
}