// src/main/java/com/nangnaidee/backend/repo/BookingRepository.java

package com.nangnaidee.backend.repo;


import com.nangnaidee.backend.model.Booking;
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
}
