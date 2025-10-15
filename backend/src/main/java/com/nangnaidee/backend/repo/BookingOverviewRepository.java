// src/main/java/com/nangnaidee/backend/repo/BookingOverviewRepository.java

package com.nangnaidee.backend.repo;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface BookingOverviewRepository extends Repository<com.nangnaidee.backend.model.Booking, UUID> {

    @Query(value = """
      SELECT 
        b.id as booking_id, b.status as booking_status, b.booking_code, 
        b.start_time, b.end_time, b.hours, b.total,
        u.id as unit_id, u.code as unit_code, u.name as unit_name, 
        u.image_url as unit_img, u.capacity, u.short_desc,
        l.id as loc_id, l.name as loc_name, l.address_text, l.geo_lat, l.geo_lng, l.cover_image_url,
        p.id as payment_id, p.status as payment_status, p.proof_url,
        /* รีวิวรวมของ location (optional) */
        AVG_REV.avg_rating, AVG_REV.cnt_rating,
        /* รีวิวของ booking นี้ (มี=review_id) */
        r.id as review_id
      FROM dbo.bookings b
      JOIN dbo.location_units u ON u.id = b.location_unit_id
      JOIN dbo.locations l ON l.id = u.location_id
      LEFT JOIN dbo.payments p ON p.booking_id = b.id
      LEFT JOIN dbo.reviews r ON r.booking_id = b.id
      /* สรุปเรตติ้งของ location */
      LEFT JOIN (
        SELECT location_id, AVG(CAST(rating as float)) as avg_rating, COUNT(*) as cnt_rating
        FROM dbo.reviews
        GROUP BY location_id
      ) AVG_REV ON AVG_REV.location_id = l.id
      WHERE b.user_id = :userId
        AND (:status IS NULL OR b.status = :status)
      ORDER BY b.created_at DESC
      """,
            countQuery = """
        SELECT COUNT(*) 
        FROM dbo.bookings b
        WHERE b.user_id = :userId
          AND (:status IS NULL OR b.status = :status)
      """,
            nativeQuery = true)
    Page<Object[]> findMyOverview(@Param("userId") Integer userId,
                                  @Param("status") String status,
                                  Pageable pageable);
}
