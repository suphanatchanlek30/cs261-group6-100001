package com.nangnaidee.backend.controller;

import java.io.ByteArrayOutputStream;
import java.io.StringWriter;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.nangnaidee.backend.config.JwtTokenProvider;
import com.nangnaidee.backend.dto.AdminFinanceDashboardResponse;
import com.nangnaidee.backend.dto.FinanceSummaryResponse;
import com.nangnaidee.backend.dto.UsageReportResponse;
import com.nangnaidee.backend.exception.ForbiddenException;
import com.nangnaidee.backend.exception.UnauthorizedException;
import com.nangnaidee.backend.model.User;
import com.nangnaidee.backend.repo.PaymentRepository;
import com.nangnaidee.backend.repo.UserRepository;
import com.nangnaidee.backend.service.AdminService;

import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminReportController {

    private final AdminService adminService;
    private final PaymentRepository paymentRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;

    @GetMapping("/usage")
    public ResponseEntity<UsageReportResponse> getUsageReport(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to
    ) {
        UsageReportResponse response = adminService.getUsageReport(authorizationHeader, from, to);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/finance/summary")
    public ResponseEntity<FinanceSummaryResponse> getFinanceSummary(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false, name = "groupBy") String groupBy
    ) {
        FinanceSummaryResponse response = adminService.getFinanceSummary(authorizationHeader, from, to, groupBy);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/finance/dashboard")
    public ResponseEntity<AdminFinanceDashboardResponse> getFinanceDashboard(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String view // month | year
    ) {
        AdminFinanceDashboardResponse resp = adminService.getFinanceDashboard(authorizationHeader, from, to, view);
        return ResponseEntity.ok(resp);
    }

    @GetMapping("/export")
    public ResponseEntity<?> exportReport(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam("type") String type,
            @RequestParam(value = "format", defaultValue = "csv") String format,
            @RequestParam(value = "year", required = false) Integer year
    ) {
        
        // Validate type
        if (!"monthly".equals(type) && !"yearly".equals(type)) {
            return ResponseEntity.badRequest()
                    .body("Invalid type. Supported values: 'monthly', 'yearly'");
        }
        
        // Validate format
        if (!format.equals("csv") && !format.equals("xlsx")) {
            return ResponseEntity.badRequest()
                    .body("Invalid format. Only 'csv' and 'xlsx' are supported.");
        }
        
        try {
            if ("monthly".equals(type)) {
                if ("csv".equals(format)) {
                    return exportMonthlyRevenueCsv(authorizationHeader, year);
                } else {
                    return exportMonthlyRevenueXlsx(authorizationHeader, year);
                }
            } else { // yearly
                if ("csv".equals(format)) {
                    return exportYearlyRevenueCsv(authorizationHeader);
                } else {
                    return exportYearlyRevenueXlsx(authorizationHeader);
                }
            }
        } catch (Exception e) {
            return ResponseEntity.status(500)
                    .body("Export failed: " + e.getMessage());
        }
    }
    
    // Monthly Revenue Report - รายได้แต่ละ location ในแต่ละเดือน (12 เดือน)
    private ResponseEntity<?> exportMonthlyRevenueCsv(String authorizationHeader, Integer year) {
        validateAdminAccess(authorizationHeader);
        
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        List<Object[]> monthlyData = paymentRepository.findMonthlyRevenueByLocation(targetYear);
        
        StringWriter csvWriter = new StringWriter();
        csvWriter.write("Location Name,Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec,Total\n");
        
        for (Object[] row : monthlyData) {
            csvWriter.write(String.format("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                nvl(row[0]), // Location Name
                nvl(row[1]), nvl(row[2]), nvl(row[3]), nvl(row[4]), // Jan-Apr
                nvl(row[5]), nvl(row[6]), nvl(row[7]), nvl(row[8]), // May-Aug
                nvl(row[9]), nvl(row[10]), nvl(row[11]), nvl(row[12]), // Sep-Dec
                nvl(row[13]) // Total
            ));
        }
        
        String filename = "monthly_revenue_" + targetYear + "_" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(csvWriter.toString());
    }
    
    private ResponseEntity<?> exportMonthlyRevenueXlsx(String authorizationHeader, Integer year) {
        validateAdminAccess(authorizationHeader);
        
        int targetYear = (year != null) ? year : LocalDate.now().getYear();
        List<Object[]> monthlyData = paymentRepository.findMonthlyRevenueByLocation(targetYear);
        
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            String excelContent = "Location Name\tJan\tFeb\tMar\tApr\tMay\tJun\tJul\tAug\tSep\tOct\tNov\tDec\tTotal\n";
            
            for (Object[] row : monthlyData) {
                excelContent += String.format("%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n",
                    nvl(row[0]), // Location Name
                    nvl(row[1]), nvl(row[2]), nvl(row[3]), nvl(row[4]), // Jan-Apr
                    nvl(row[5]), nvl(row[6]), nvl(row[7]), nvl(row[8]), // May-Aug
                    nvl(row[9]), nvl(row[10]), nvl(row[11]), nvl(row[12]), // Sep-Dec
                    nvl(row[13]) // Total
                );
            }
            
            outputStream.write(excelContent.getBytes());
            
            String filename = "monthly_revenue_" + targetYear + "_" + 
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx";
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(outputStream.toByteArray());
                    
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }

    // Yearly Revenue Report - รายได้แต่ละ location ในแต่ละปี (10 ปีล่าสุด)
    private ResponseEntity<?> exportYearlyRevenueCsv(String authorizationHeader) {
        validateAdminAccess(authorizationHeader);
        
        List<Object[]> yearlyData = paymentRepository.findYearlyRevenueByLocation();
        
        StringWriter csvWriter = new StringWriter();
        csvWriter.write("Location Name,2016,2017,2018,2019,2020,2021,2022,2023,2024,2025,Total\n");
        
        for (Object[] row : yearlyData) {
            csvWriter.write(String.format("%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s\n",
                nvl(row[0]), // Location Name
                nvl(row[1]), nvl(row[2]), nvl(row[3]), nvl(row[4]), nvl(row[5]), // 2016-2020
                nvl(row[6]), nvl(row[7]), nvl(row[8]), nvl(row[9]), nvl(row[10]), // 2021-2025
                nvl(row[11]) // Total
            ));
        }
        
        String filename = "yearly_revenue_" + 
                LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".csv";
        
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.TEXT_PLAIN)
                .body(csvWriter.toString());
    }
    
    private ResponseEntity<?> exportYearlyRevenueXlsx(String authorizationHeader) {
        validateAdminAccess(authorizationHeader);
        
        List<Object[]> yearlyData = paymentRepository.findYearlyRevenueByLocation();
        
        try {
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            String excelContent = "Location Name\t2016\t2017\t2018\t2019\t2020\t2021\t2022\t2023\t2024\t2025\tTotal\n";
            
            for (Object[] yearlyRow : yearlyData) {
                excelContent += String.format("%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\t%s\n",
                    nvl(yearlyRow[0]), // Location Name
                    nvl(yearlyRow[1]), nvl(yearlyRow[2]), nvl(yearlyRow[3]), nvl(yearlyRow[4]), nvl(yearlyRow[5]), // 2016-2020
                    nvl(yearlyRow[6]), nvl(yearlyRow[7]), nvl(yearlyRow[8]), nvl(yearlyRow[9]), nvl(yearlyRow[10]), // 2021-2025
                    nvl(yearlyRow[11]) // Total
                );
            }
            
            outputStream.write(excelContent.getBytes());
            
            String filename = "yearly_revenue_" + 
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx";
            
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(outputStream.toByteArray());
                    
        } catch (Exception e) {
            throw new RuntimeException("Failed to generate Excel file", e);
        }
    }
    
    // Helper methods
    private void validateAdminAccess(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("ต้องส่งโทเคนแบบ Bearer");
        }
        
        String token = authorizationHeader.substring("Bearer ".length()).trim();
        Integer userId;
        try {
            userId = jwtTokenProvider.getUserId(token);
        } catch (JwtException | IllegalArgumentException e) {
            throw new UnauthorizedException("โทเคนไม่ถูกต้องหรือหมดอายุ");
        }
        
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("ไม่พบผู้ใช้"));
        
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> "ADMIN".equals(role.getCode()));
        
        if (!isAdmin) {
            throw new ForbiddenException("ต้องเป็น ADMIN เท่านั้น");
        }
    }
    
    private LocalDateTime[] parseDateRange(String fromDate, String toDate) {
        LocalDateTime fromDateTime;
        LocalDateTime toDateTime;
        
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            
            if (fromDate == null || fromDate.isBlank()) {
                fromDateTime = LocalDate.now().minusDays(30).atStartOfDay();
            } else {
                fromDateTime = LocalDate.parse(fromDate, formatter).atStartOfDay();
            }
            
            if (toDate == null || toDate.isBlank()) {
                toDateTime = LocalDate.now().atTime(23, 59, 59);
            } else {
                toDateTime = LocalDate.parse(toDate, formatter).atTime(23, 59, 59);
            }
        } catch (DateTimeParseException e) {
            throw new IllegalArgumentException("รูปแบบวันที่ไม่ถูกต้อง ใช้ yyyy-MM-dd");
        }
        
        if (fromDateTime.isAfter(toDateTime)) {
            throw new IllegalArgumentException("วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด");
        }
        
        return new LocalDateTime[]{fromDateTime, toDateTime};
    }
    
    private String nvl(Object obj) {
        return obj != null ? obj.toString() : "";
    }
}