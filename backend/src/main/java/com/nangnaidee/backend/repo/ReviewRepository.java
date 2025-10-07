// src/main/java/com/nangnaidee/backend/repo/ReviewRepository.java

package com.nangnaidee.backend.repo;

import com.nangnaidee.backend.model.Review;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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
    
    // Find reviews by location ID with optional minRating filter
    @Query(value = """
        SELECT r.id, r.booking_id, r.user_id, u.full_name as user_first_name, 
               r.rating, r.comment, r.created_at
        FROM dbo.reviews r
        JOIN dbo.users u ON u.id = r.user_id
        WHERE r.location_id = :locationId
        AND (:minRating IS NULL OR r.rating >= :minRating)
        ORDER BY r.created_at DESC
        """, 
        countQuery = """
        SELECT COUNT(*)
        FROM dbo.reviews r
        WHERE r.location_id = :locationId
        AND (:minRating IS NULL OR r.rating >= :minRating)
        """,
        nativeQuery = true)
    Page<Object[]> findByLocationIdWithRatingFilter(@Param("locationId") UUID locationId, 
                                                   @Param("minRating") Integer minRating, 
                                                   Pageable pageable);
}