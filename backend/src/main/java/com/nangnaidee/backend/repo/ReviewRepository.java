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

    @Query(value = """
    SELECT 
        CAST(AVG(CAST(r.rating AS DECIMAL(10,2))) AS DECIMAL(10,2)) AS avg_rating,
        COUNT(*) AS total_reviews,
        COUNT(DISTINCT r.user_id) AS reviewers,
        SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END) AS r5,
        SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END) AS r4,
        SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END) AS r3,
        SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END) AS r2,
        SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END) AS r1
    FROM dbo.reviews r
    WHERE r.location_id = :locationId
      AND (:minRating IS NULL OR r.rating >= :minRating)
    """, nativeQuery = true)
    java.util.List<Object[]> aggregateStatsByLocation(@Param("locationId") java.util.UUID locationId,
                                                      @Param("minRating") Integer minRating);


    @Query(value = """
        SELECT 
            r.id            AS review_id,
            r.booking_id    AS booking_id,
            r.user_id       AS user_id,
            u.full_name     AS user_name,
            r.rating        AS rating,
            r.comment       AS comment,
            r.created_at    AS created_at,
            l.id            AS location_id,
            l.name          AS location_name,
            l.cover_image_url AS cover_image_url
        FROM dbo.reviews r
        JOIN dbo.users u     ON u.id = r.user_id
        JOIN dbo.locations l ON l.id = r.location_id
        WHERE 
            (:locationId IS NULL OR r.location_id = :locationId)
            AND (:minRating IS NULL OR r.rating >= :minRating)
            AND (
                :q IS NULL OR
                LOWER(u.full_name) LIKE LOWER(CONCAT('%', :q, '%')) OR
                LOWER(l.name)      LIKE LOWER(CONCAT('%', :q, '%')) OR
                LOWER(COALESCE(r.comment,'')) LIKE LOWER(CONCAT('%', :q, '%'))
            )
        """,
            countQuery = """
        SELECT COUNT(*) 
        FROM dbo.reviews r
        JOIN dbo.users u     ON u.id = r.user_id
        JOIN dbo.locations l ON l.id = r.location_id
        WHERE 
            (:locationId IS NULL OR r.location_id = :locationId)
            AND (:minRating IS NULL OR r.rating >= :minRating)
            AND (
                :q IS NULL OR
                LOWER(u.full_name) LIKE LOWER(CONCAT('%', :q, '%')) OR
                LOWER(l.name)      LIKE LOWER(CONCAT('%', :q, '%')) OR
                LOWER(COALESCE(r.comment,'')) LIKE LOWER(CONCAT('%', :q, '%'))
            )
        """,
            nativeQuery = true)
    Page<Object[]> adminSearchReviews(
            @Param("q") String q,
            @Param("locationId") UUID locationId,
            @Param("minRating") Integer minRating,
            Pageable pageable
    );
}