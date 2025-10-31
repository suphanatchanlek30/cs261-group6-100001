// src/main/java/com/nangnaidee/backend/repo/BookingDetailRepository.java

package com.nangnaidee.backend.repo;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.data.repository.CrudRepository;

import java.util.Optional;
import java.util.UUID;

public interface BookingDetailRepository extends CrudRepository<com.nangnaidee.backend.model.Booking, UUID> {

    // คืน 1 แถว Object[] ตามลำดับคอลัมน์ที่เราจะ map ใน Service
    @Query(value = """
        SELECT 
            b.id, b.status, b.booking_code, b.start_time, b.end_time, b.hours, b.total,

            u.id AS unit_id, u.code AS unit_code, u.name AS unit_name, 
            u.image_url, u.capacity, u.short_desc,

            l.id AS location_id, l.name AS location_name, l.address_text,
            l.geo_lat, l.geo_lng, l.cover_image_url,

            p.id AS payment_id, p.status AS payment_status, p.proof_url,

            rx.avg_rating, rx.review_count,

            rself.id AS my_review_id

        FROM dbo.bookings b
        JOIN dbo.location_units u ON u.id = b.location_unit_id
        JOIN dbo.locations l ON l.id = u.location_id
        LEFT JOIN dbo.payments p ON p.booking_id = b.id
        LEFT JOIN (
            SELECT location_id, AVG(CAST(rating AS float)) AS avg_rating, COUNT(*) AS review_count
            FROM dbo.reviews
            GROUP BY location_id
        ) rx ON rx.location_id = l.id
        LEFT JOIN dbo.reviews rself ON rself.booking_id = b.id
        WHERE b.id = :bookingId
        """, nativeQuery = true)
    Optional<Object[]> findDetailById(@Param("bookingId") UUID bookingId);
}
