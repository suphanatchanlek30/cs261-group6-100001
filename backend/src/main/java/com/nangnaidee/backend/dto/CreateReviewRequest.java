package com.nangnaidee.backend.dto;

import jakarta.validation.constraints.*;
import java.util.UUID;

/**
 * Request DTO for creating a review
 */
public class CreateReviewRequest {
    
    @NotNull(message = "Booking ID ห้ามเป็นค่าว่าง")
    private UUID bookingId;
    
    @NotNull(message = "Rating ห้ามเป็นค่าว่าง")
    @Min(value = 1, message = "Rating ต้องอย่างน้อย 1")
    @Max(value = 5, message = "Rating ต้องไม่เกิน 5")
    private Integer rating;
    
    @Size(max = 1000, message = "Comment ต้องไม่เกิน 1000 ตัวอักษร")
    private String comment;
    
    public CreateReviewRequest() {}
    
    public CreateReviewRequest(UUID bookingId, Integer rating, String comment) {
        this.bookingId = bookingId;
        this.rating = rating;
        this.comment = comment;
    }
    
    public UUID getBookingId() {
        return bookingId;
    }
    
    public void setBookingId(UUID bookingId) {
        this.bookingId = bookingId;
    }
    
    public Integer getRating() {
        return rating;
    }
    
    public void setRating(Integer rating) {
        this.rating = rating;
    }
    
    public String getComment() {
        return comment;
    }
    
    public void setComment(String comment) {
        this.comment = comment;
    }
}