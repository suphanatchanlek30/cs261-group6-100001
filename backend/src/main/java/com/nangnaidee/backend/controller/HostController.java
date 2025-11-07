package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.dto.GetAllBookingHostResponse;
import com.nangnaidee.backend.dto.GetBookingHostResponse;
import com.nangnaidee.backend.dto.HostRevenueSummaryResponse;
import com.nangnaidee.backend.service.HostService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/host")
@RequiredArgsConstructor
public class HostController {

    private final HostService hostService;

    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<GetBookingHostResponse> getBooking(
            @RequestHeader(name = "Authorization") String authorizationHeader,
            @PathVariable String bookingId) {
        GetBookingHostResponse response = hostService.getBooking(authorizationHeader, bookingId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/bookings")
    public ResponseEntity<Page<GetAllBookingHostResponse>> getAllBookings(
            @RequestHeader(name = "Authorization") String authorizationHeader,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID locationId,
            @RequestParam(required = false) UUID unitId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort) {

        Page<GetAllBookingHostResponse> response = hostService.getallBooking(
                authorizationHeader,
                status,
                locationId,
                unitId,
                from,
                to,
                page,
                size,
                sort);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/revenue/summary")
    public ResponseEntity<List<HostRevenueSummaryResponse>> getRevenueSummary(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "day") String groupBy) {
        
        return ResponseEntity.ok(hostService.getRevenueSummary(
            authorizationHeader, from, to, groupBy));
    }
}
