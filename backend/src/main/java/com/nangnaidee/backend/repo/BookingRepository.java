// src/main/java/com/nangnaidee/backend/repo/BookingRepository.java

package com.nangnaidee.backend.repo;


import com.nangnaidee.backend.model.Booking;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.UUID;
import java.time.LocalDateTime;   // <-- เพิ่ม
import java.util.List;           // <-- เพิ่ม

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

    // Check if a unit has any active bookings (excluding cancelled and expired)
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.locationUnitId = :unitId AND b.status IN ('HOLD', 'PENDING_REVIEW', 'CONFIRMED')")
    boolean existsActiveBookingsByLocationUnitId(@Param("unitId") UUID unitId);

    // Check if a unit has any bookings at all
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.locationUnitId = :unitId")
    boolean existsByLocationUnitId(@Param("unitId") UUID unitId);

    // Count active bookings for better error messaging
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.locationUnitId = :unitId AND b.status IN ('HOLD', 'PENDING_REVIEW', 'CONFIRMED')")
    long countActiveBookingsByLocationUnitId(@Param("unitId") UUID unitId);

    // Count all bookings for better error messaging  
    @Query("SELECT COUNT(b) FROM Booking b WHERE b.locationUnitId = :unitId")
    long countAllBookingsByLocationUnitId(@Param("unitId") UUID unitId);

    // ---------- เพิ่มเมธอดนี้สำหรับหา booking ที่ทับช่วง ----------
    @Query("""
        SELECT b FROM Booking b
        WHERE b.locationUnitId = :unitId
          AND b.status IN ('HOLD', 'PENDING_REVIEW', 'CONFIRMED')
          AND b.startTime < :to
          AND b.endTime   > :from
        ORDER BY b.startTime ASC
    """)
    List<Booking> findActiveOverlapsByUnitId(@Param("unitId") UUID unitId,
                                             @Param("from") LocalDateTime from,
                                             @Param("to") LocalDateTime to);
}
