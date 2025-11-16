package com.nangnaidee.backend.dto;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminFinanceDashboardResponse {
    private DashboardCards cards;
    private String view; // month | year
    private Integer year; // เมื่อ view=month ใช้ระบุปีที่แสดง
    private List<MonthIncomeBucket> months; // 12 เดือน (ถ้า view=month)
    private List<YearIncomeBucket> years;   // หลายปี (ถ้า view=year)

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DashboardCards {
        private Long totalBookings;
        private BigDecimal totalIncome; // Approved payments sum
        private Long activeLocations;   // จำนวน locations ที่ active
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MonthIncomeBucket {
        private int month;              // 1-12
        private String label;           // Jan, Feb, ...
        private BigDecimal income;      // รายได้เดือนนี้
        private BigDecimal prevYearIncome; // รายได้เดือนเดียวกันปีก่อน (ใช้เปรียบเทียบ ถ้าไม่มีเป็น 0)
        private Long bookings;          // จำนวน bookings ที่มี payment approved ภายในเดือน
        private Long payments;          // จำนวน payments approved ภายในเดือน
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class YearIncomeBucket {
        private int year;               // ปี
        private BigDecimal income;      // รายได้รวมของปี
        private Long bookings;          // จำนวน bookings ทั้งปีที่มี payment approved
        private Long payments;          // จำนวน payments approved ทั้งปี
    }
}
