package com.nangnaidee.backend.dto;

import java.util.UUID;

/**
 * Response DTO for creating a review
 */
public class CreateReviewResponse {
    
    private UUID id;
    
    public CreateReviewResponse() {}
    
    public CreateReviewResponse(UUID id) {
        this.id = id;
    }
    
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
}