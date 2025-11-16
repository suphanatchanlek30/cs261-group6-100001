package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class UsageReportResponse {
    private Long activeUsers;      // จำนวน active users ในช่วงเวลา
    private Long newUsers;         // จำนวน users ใหม่ในช่วงเวลา
    private Long bookingsCount;    // จำนวน bookings ในช่วงเวลา
    private Long hostsOnboarded;   // จำนวน hosts ใหม่ในช่วงเวลา
    private Long reviewsCount;     // จำนวน reviews ในช่วงเวลา
}