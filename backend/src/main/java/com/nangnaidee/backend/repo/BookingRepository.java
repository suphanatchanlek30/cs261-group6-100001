// src/main/java/com/nangnaidee/backend/repo/BookingRepository.java

package com.nangnaidee.backend.repo;


import com.nangnaidee.backend.model.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;

public interface BookingRepository extends JpaRepository<Booking, UUID> {

    @Query(value = """
        SELECT COUNT(*)
        FROM dbo.bookings b
        JOIN dbo.location_units u ON u.id = b.location_unit_id
        WHERE u.location_id = :locationId
        """, nativeQuery = true)
    long countByLocationId(@Param("locationId") UUID locationId);

    // Find bookings by user ID with optional status filter
    @Query("SELECT b FROM Booking b WHERE b.userId = :userId AND (:status IS NULL OR b.status = :status) ORDER BY b.createdAt DESC")
    Page<Booking> findByUserIdAndStatus(@Param("userId") Integer userId, @Param("status") String status, Pageable pageable);

    // Find all bookings by user ID without status filter
    @Query("SELECT b FROM Booking b WHERE b.userId = :userId ORDER BY b.createdAt DESC")
    Page<Booking> findByUserId(@Param("userId") Integer userId, Pageable pageable);
}
