// src/main/java/com/nangnaidee/backend/dto/CancelBookingResponse.java

package com.nangnaidee.backend.dto;

/**
 * Response DTO for booking cancellation
 */
public class CancelBookingResponse {
    
    private String status;
    
    public CancelBookingResponse() {}
    
    public CancelBookingResponse(String status) {
        this.status = status;
    }
    
    public String getStatus() {
        return status;
    }
    
    public void setStatus(String status) {
        this.status = status;
    }
}