package com.nangnaidee.backend.repo;

import com.nangnaidee.backend.dto.RevenueTransactionDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.UUID;

public interface RevenueTransactionRepository extends JpaRepository<com.nangnaidee.backend.model.Payment, UUID> {

    @Query(value = """
        SELECT 
               p.booking_id as bookingId,
               p.id as paymentId,
               p.amount as amount,
               p.method as method,
               p.reviewed_at as approvedAt,
               l.name as locationName
        FROM payments p
        JOIN bookings b ON b.id = p.booking_id
        JOIN location_units u ON u.id = b.location_unit_id
        JOIN locations l ON l.id = u.location_id
        WHERE p.status = 'APPROVED'
        AND l.owner_id = :ownerId
        AND (:locationId IS NULL OR l.id = :locationId)
        AND (:method IS NULL OR p.method = :method)
        AND (:from IS NULL OR p.reviewed_at >= :from)
        AND (:to IS NULL OR p.reviewed_at <= :to)
        ORDER BY p.reviewed_at DESC
    """, 
    countQuery = """
        SELECT COUNT(*)
        FROM payments p
        JOIN bookings b ON b.id = p.booking_id
        JOIN location_units u ON u.id = b.location_unit_id
        JOIN locations l ON l.id = u.location_id
        WHERE p.status = 'APPROVED'
        AND l.owner_id = :ownerId
        AND (:locationId IS NULL OR l.id = :locationId)
        AND (:method IS NULL OR p.method = :method)
        AND (:from IS NULL OR p.approved_at >= :from)
        AND (:to IS NULL OR p.approved_at <= :to)
    """,
    nativeQuery = true)
    Page<Object[]> findRevenueTransactions(
        @Param("ownerId") Integer ownerId,
        @Param("locationId") UUID locationId,
        @Param("method") String method,
        @Param("from") LocalDateTime from,
        @Param("to") LocalDateTime to,
        Pageable pageable
    );

}