package com.nangnaidee.backend.repo;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import com.nangnaidee.backend.model.Booking;

public interface HostRevenueSummaryRepository extends Repository<Booking, UUID> {
    
    @Query(value = """
        SELECT 
            CAST(b.start_time AS DATE) as date,
            SUM(b.total) as total_revenue,
            COUNT(*) as total_bookings
        FROM dbo.bookings b
        JOIN dbo.location_units lu ON b.location_unit_id = lu.id 
        JOIN dbo.locations l ON lu.location_id = l.id
        WHERE l.owner_id = :hostId
        AND b.status = 'Confirmed'  -- รวมทุก status ที่มีการจอง
        AND b.start_time BETWEEN :from AND :to
        GROUP BY CAST(b.start_time AS DATE)
        ORDER BY date
    """, nativeQuery = true)
    List<Object[]> findRevenueSummaryByDay(
        @Param("hostId") Integer hostId,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );

    @Query(value = """
        SELECT 
            YEAR(b.start_time) as yr,
            MONTH(b.start_time) as mon,
            SUM(b.total) as total_revenue,
            COUNT(*) as total_bookings
        FROM dbo.bookings b
        JOIN dbo.location_units lu ON b.location_unit_id = lu.id 
        JOIN dbo.locations l ON lu.location_id = l.id
        WHERE l.owner_id = :hostId
        AND b.status = 'Confirmed'
        AND b.start_time BETWEEN :from AND :to
        GROUP BY YEAR(b.start_time), MONTH(b.start_time)
        ORDER BY yr, mon
    """, nativeQuery = true)
    List<Object[]> findRevenueSummaryByMonth(
        @Param("hostId") Integer hostId,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );

    @Query(value = """
        SELECT 
            YEAR(b.start_time) as yr,
            SUM(b.total) as total_revenue,
            COUNT(*) as total_bookings
        FROM dbo.bookings b
        JOIN dbo.location_units lu ON b.location_unit_id = lu.id 
        JOIN dbo.locations l ON lu.location_id = l.id
        WHERE l.owner_id = :hostId
        AND b.status = 'Confirmed'
        AND b.start_time BETWEEN :from AND :to
        GROUP BY YEAR(b.start_time)
        ORDER BY yr
    """, nativeQuery = true)
    List<Object[]> findRevenueSummaryByYear(
        @Param("hostId") Integer hostId,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to
    );
}