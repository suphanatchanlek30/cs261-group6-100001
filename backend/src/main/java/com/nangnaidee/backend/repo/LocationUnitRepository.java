// src/main/java/com/nangnaidee/backend/repo/LocationUnitRepository.java

package com.nangnaidee.backend.repo;

import com.nangnaidee.backend.model.LocationUnit;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface LocationUnitRepository extends JpaRepository<LocationUnit, UUID> {
    List<LocationUnit> findByLocation_IdOrderByCodeAsc(UUID locationId);

    // ใช้เช็ค code ซ้ำใน location เดียวกัน (ไม่สนตัวพิมพ์)
    boolean existsByLocation_IdAndCodeIgnoreCase(UUID locationId, String code);

    // Search available units - ใช้ subquery เพื่อแก้ปัญหา alias ใน ORDER BY
    @Query(value = """
        WITH AvailableUnitsWithDistance AS (
            SELECT DISTINCT u.id, u.code, u.name, u.image_url, u.short_desc, u.capacity, u.price_hourly,
                   l.id as location_id, l.name as location_name, l.address_text, l.geo_lat, l.geo_lng, l.cover_image_url,
                   CASE 
                       WHEN :searchLat IS NOT NULL AND :searchLng IS NOT NULL AND l.geo_lat IS NOT NULL AND l.geo_lng IS NOT NULL
                       THEN 6371 * ACOS(
                           COS(RADIANS(:searchLat)) * COS(RADIANS(l.geo_lat)) * 
                           COS(RADIANS(l.geo_lng) - RADIANS(:searchLng)) + 
                           SIN(RADIANS(:searchLat)) * SIN(RADIANS(l.geo_lat))
                       )
                       ELSE NULL
                   END as distance_km
            FROM dbo.location_units u
            INNER JOIN dbo.locations l ON u.location_id = l.id
            WHERE u.is_active = 1 AND l.is_active = 1
            AND NOT EXISTS (
                SELECT 1 FROM dbo.bookings b 
                WHERE b.location_unit_id = u.id 
                AND b.status IN ('HOLD', 'PENDING_REVIEW', 'CONFIRMED')
                AND b.start_time < :endTime AND b.end_time > :startTime
            )
            AND (:searchQuery IS NULL OR 
                 l.name LIKE :searchQuery OR 
                 l.address_text LIKE :searchQuery OR 
                 u.name LIKE :searchQuery OR 
                 u.short_desc LIKE :searchQuery)
            AND (:searchLat IS NULL OR :searchLng IS NULL OR :radiusKm IS NULL OR 
                 l.geo_lat IS NULL OR l.geo_lng IS NULL OR
                 6371 * ACOS(
                     COS(RADIANS(:searchLat)) * COS(RADIANS(l.geo_lat)) * 
                     COS(RADIANS(l.geo_lng) - RADIANS(:searchLng)) + 
                     SIN(RADIANS(:searchLat)) * SIN(RADIANS(l.geo_lat))
                 ) <= :radiusKm)
        )
        SELECT * FROM AvailableUnitsWithDistance
        ORDER BY 
            CASE WHEN :searchLat IS NOT NULL AND :searchLng IS NOT NULL THEN distance_km END ASC,
            location_name ASC, code ASC
        """, 
        countQuery = """
        SELECT COUNT(DISTINCT u.id)
        FROM dbo.location_units u
        INNER JOIN dbo.locations l ON u.location_id = l.id
        WHERE u.is_active = 1 AND l.is_active = 1
        AND NOT EXISTS (
            SELECT 1 FROM dbo.bookings b 
            WHERE b.location_unit_id = u.id 
            AND b.status IN ('HOLD', 'PENDING_REVIEW', 'CONFIRMED')
            AND b.start_time < :endTime AND b.end_time > :startTime
        )
        AND (:searchQuery IS NULL OR 
             l.name LIKE :searchQuery OR 
             l.address_text LIKE :searchQuery OR 
             u.name LIKE :searchQuery OR 
             u.short_desc LIKE :searchQuery)
        AND (:searchLat IS NULL OR :searchLng IS NULL OR :radiusKm IS NULL OR 
             l.geo_lat IS NULL OR l.geo_lng IS NULL OR
             6371 * ACOS(
                 COS(RADIANS(:searchLat)) * COS(RADIANS(l.geo_lat)) * 
                 COS(RADIANS(l.geo_lng) - RADIANS(:searchLng)) + 
                 SIN(RADIANS(:searchLat)) * SIN(RADIANS(l.geo_lat))
             ) <= :radiusKm)
        """,
        nativeQuery = true)
    Page<Object[]> findAvailableUnits(
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("searchQuery") String searchQuery,
            @Param("searchLat") Double searchLat,
            @Param("searchLng") Double searchLng,
            @Param("radiusKm") Double radiusKm,
            Pageable pageable
    );
}
