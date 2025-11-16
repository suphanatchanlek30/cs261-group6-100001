package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FinanceSummaryBucket {
    private LocalDate periodStart;    // วันที่เริ่มของ bucket (วันแรก หรือ วันเริ่มของสัปดาห์)
    private LocalDate periodEnd;      // วันที่สิ้นสุดของ bucket (ถ้า groupBy=day จะเท่ากับ periodStart)
    private BigDecimal revenue;       // รวมยอดชำระที่ APPROVED ในช่วง bucket
    private Long paymentsCount;       // จำนวน payments ที่ APPROVED
    private Long bookingsCount;       // จำนวน bookings ที่มี payment APPROVED
}
