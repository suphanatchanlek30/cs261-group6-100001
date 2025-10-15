// src/main/java/com/nangnaidee/backend/dto/ReviewListItem.java

package com.nangnaidee.backend.dto;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * DTO for individual review item in list
 */
public class ReviewListItem {
    
    private UUID id;
    private UUID bookingId;
    private Integer userId;
    private String userFirstName; // เพื่อแสดงชื่อผู้รีวิว
    private Integer rating;
    private String comment;
    private LocalDateTime createdAt;
    
    public ReviewListItem() {}
    
    public ReviewListItem(UUID id, UUID bookingId, Integer userId, String userFirstName, 
                         Integer rating, String comment, LocalDateTime createdAt) {
        this.id = id;
        this.bookingId = bookingId;
        this.userId = userId;
        this.userFirstName = userFirstName;
        this.rating = rating;
        this.comment = comment;
        this.createdAt = createdAt;
    }
    
    public UUID getId() {
        return id;
    }
    
    public void setId(UUID id) {
        this.id = id;
    }
    
    public UUID getBookingId() {
        return bookingId;
    }
    
    public void setBookingId(UUID bookingId) {
        this.bookingId = bookingId;
    }
    
    public Integer getUserId() {
        return userId;
    }
    
    public void setUserId(Integer userId) {
        this.userId = userId;
    }
    
    public String getUserFirstName() {
        return userFirstName;
    }
    
    public void setUserFirstName(String userFirstName) {
        this.userFirstName = userFirstName;
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
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}