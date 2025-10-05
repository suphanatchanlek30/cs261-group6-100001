package com.nangnaidee.backend.repo;

import com.nangnaidee.backend.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface ReviewRepository extends JpaRepository<Review, UUID> {
    
    // Check if a review already exists for this booking
    boolean existsByBookingId(UUID bookingId);
    
    // Find review by booking ID
    @Query("SELECT r FROM Review r WHERE r.bookingId = :bookingId")
    Review findByBookingId(@Param("bookingId") UUID bookingId);
}