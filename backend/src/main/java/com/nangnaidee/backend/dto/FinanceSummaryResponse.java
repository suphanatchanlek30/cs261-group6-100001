package com.nangnaidee.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FinanceSummaryResponse {
    private LocalDate fromDate;          // วันที่เริ่ม (normalized)
    private LocalDate toDate;            // วันที่สิ้นสุด (normalized)
    private String groupBy;              // "DAY" หรือ "WEEK"
    private String currency = "THB";    // สกุลเงิน (สมมติ THB)
    private BigDecimal totalRevenue;     // รวมรายได้ทั้งหมดในช่วง
    private Long totalPayments;          // จำนวน payments APPROVED ทั้งหมด
    private Long totalBookings;          // จำนวน bookings มี payment APPROVED ทั้งหมด
    private List<FinanceSummaryBucket> buckets; // รายการ bucket
}
