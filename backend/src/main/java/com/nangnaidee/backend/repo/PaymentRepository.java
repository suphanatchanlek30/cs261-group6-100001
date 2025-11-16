// src/main/java/com/nangnaidee/backend/repo/PaymentRepository.java

package com.nangnaidee.backend.repo;

import com.nangnaidee.backend.model.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    Optional<Payment> findByBookingId(UUID bookingId);

    boolean existsByBookingId(UUID bookingId);

    Page<Payment> findByStatus(String status, Pageable pageable);
    
    /**
     * Export Queries - ดึงข้อมูล transactions ทั้งหมดสำหรับ admin export
     */
    @Query(value = """
        SELECT p.id as payment_id, 
               b.id as booking_id, 
               u.email as user_email,
               p.amount, 
               p.status, 
               p.method,
               p.created_at,
               host.email as host_email,
               loc.name as location_name
        FROM payments p
        JOIN bookings b ON b.id = p.booking_id  
        JOIN users u ON u.id = b.user_id
        JOIN location_units lu ON lu.id = b.location_unit_id
        JOIN locations loc ON loc.id = lu.location_id
        JOIN users host ON host.id = loc.owner_id
        WHERE p.created_at >= :fromDate AND p.created_at <= :toDate
        ORDER BY p.created_at DESC
        """, nativeQuery = true)
    List<Object[]> findTransactionsForExport(@Param("fromDate") LocalDateTime fromDate, @Param("toDate") LocalDateTime toDate);

    /**
     * Monthly Revenue Report - รายได้แต่ละ location ในแต่ละเดือน (12 เดือน)
     */
    @Query(value = """
        SELECT 
            loc.name as location_name,
            COALESCE(SUM(CASE WHEN MONTH(p.created_at) = 1 THEN p.amount ELSE 0 END), 0) as jan_revenue,
            COALESCE(SUM(CASE WHEN MONTH(p.created_at) = 2 THEN p.amount ELSE 0 END), 0) as feb_revenue,
            COALESCE(SUM(CASE WHEN MONTH(p.created_at) = 3 THEN p.amount ELSE 0 END), 0) as mar_revenue,
            COALESCE(SUM(CASE WHEN MONTH(p.created_at) = 4 THEN p.amount ELSE 0 END), 0) as apr_revenue,
            COALESCE(SUM(CASE WHEN MONTH(p.created_at) = 5 THEN p.amount ELSE 0 END), 0) as may_revenue,
            COALESCE(SUM(CASE WHEN MONTH(p.created_at) = 6 THEN p.amount ELSE 0 END), 0) as jun_revenue,
            COALESCE(SUM(CASE WHEN MONTH(p.created_at) = 7 THEN p.amount ELSE 0 END), 0) as jul_revenue,
            COALESCE(SUM(CASE WHEN MONTH(p.created_at) = 8 THEN p.amount ELSE 0 END), 0) as aug_revenue,
            COALESCE(SUM(CASE WHEN MONTH(p.created_at) = 9 THEN p.amount ELSE 0 END), 0) as sep_revenue,
            COALESCE(SUM(CASE WHEN MONTH(p.created_at) = 10 THEN p.amount ELSE 0 END), 0) as oct_revenue,
            COALESCE(SUM(CASE WHEN MONTH(p.created_at) = 11 THEN p.amount ELSE 0 END), 0) as nov_revenue,
            COALESCE(SUM(CASE WHEN MONTH(p.created_at) = 12 THEN p.amount ELSE 0 END), 0) as dec_revenue,
            COALESCE(SUM(p.amount), 0) as total_revenue
        FROM locations loc
        LEFT JOIN location_units lu ON lu.location_id = loc.id
        LEFT JOIN bookings b ON b.location_unit_id = lu.id
        LEFT JOIN payments p ON p.booking_id = b.id AND p.status = 'APPROVED' 
                             AND YEAR(p.created_at) = :year
        GROUP BY loc.id, loc.name
        ORDER BY total_revenue DESC
        """, nativeQuery = true)
    List<Object[]> findMonthlyRevenueByLocation(@Param("year") int year);

    /**
     * Yearly Revenue Report - รายได้แต่ละ location ในแต่ละปี (10 ปีล่าสุด)
     */
    @Query(value = """
        SELECT 
            loc.name as location_name,
            COALESCE(SUM(CASE WHEN YEAR(p.created_at) = 2016 THEN p.amount ELSE 0 END), 0) as year_2016,
            COALESCE(SUM(CASE WHEN YEAR(p.created_at) = 2017 THEN p.amount ELSE 0 END), 0) as year_2017,
            COALESCE(SUM(CASE WHEN YEAR(p.created_at) = 2018 THEN p.amount ELSE 0 END), 0) as year_2018,
            COALESCE(SUM(CASE WHEN YEAR(p.created_at) = 2019 THEN p.amount ELSE 0 END), 0) as year_2019,
            COALESCE(SUM(CASE WHEN YEAR(p.created_at) = 2020 THEN p.amount ELSE 0 END), 0) as year_2020,
            COALESCE(SUM(CASE WHEN YEAR(p.created_at) = 2021 THEN p.amount ELSE 0 END), 0) as year_2021,
            COALESCE(SUM(CASE WHEN YEAR(p.created_at) = 2022 THEN p.amount ELSE 0 END), 0) as year_2022,
            COALESCE(SUM(CASE WHEN YEAR(p.created_at) = 2023 THEN p.amount ELSE 0 END), 0) as year_2023,
            COALESCE(SUM(CASE WHEN YEAR(p.created_at) = 2024 THEN p.amount ELSE 0 END), 0) as year_2024,
            COALESCE(SUM(CASE WHEN YEAR(p.created_at) = 2025 THEN p.amount ELSE 0 END), 0) as year_2025,
            COALESCE(SUM(p.amount), 0) as total_revenue
        FROM locations loc
        LEFT JOIN location_units lu ON lu.location_id = loc.id
        LEFT JOIN bookings b ON b.location_unit_id = lu.id
        LEFT JOIN payments p ON p.booking_id = b.id AND p.status = 'APPROVED'
                             AND YEAR(p.created_at) BETWEEN 2016 AND 2025
        GROUP BY loc.id, loc.name
        ORDER BY total_revenue DESC
        """, nativeQuery = true)
    List<Object[]> findYearlyRevenueByLocation();
}
