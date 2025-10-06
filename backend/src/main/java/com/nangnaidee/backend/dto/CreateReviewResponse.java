// src/main/java/com/nangnaidee/backend/dto/CreateReviewResponse.java

package com.nangnaidee.backend.dto;

import java.util.UUID;

/**
 * Response DTO for creating a review
 */
public class CreateReviewResponse {
    
    private UUID id;
    private String message;
    
    public CreateReviewResponse() {}
    
    public CreateReviewResponse(UUID id, String message) {
        this.id = id;
        this.message = message;
    }
    
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }

    public String getMessage() { return message; }
}