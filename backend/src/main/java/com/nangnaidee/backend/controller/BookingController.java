// src/main/java/com/nangnaidee/backend/controller/BookingController.java

package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.dto.*;
import com.nangnaidee.backend.model.Booking;
import com.nangnaidee.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {
    private final BookingService bookingService;

    @PostMapping
    public ResponseEntity<CreateBookingResponse> create(
            @RequestHeader("Authorization") String authorization,
            @Valid @RequestBody CreateBookingRequest request) {
        CreateBookingResponse res = bookingService.create(authorization, request);
        return ResponseEntity.created(URI.create("/api/bookings/" + res.getId())).body(res);
    }

    @GetMapping("/me")
    public ResponseEntity<BookingListResponse> getMyBookings(
            @RequestHeader("Authorization") String authorization,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        BookingListResponse response = bookingService.getMyBookings(authorization, status, page, size);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<com.nangnaidee.backend.dto.BookingDetailResponse> getBookingDetail(
            @RequestHeader("Authorization") String authorization,
            @PathVariable("id") UUID id
    ) {
        var dto = bookingService.getBookingDetailDto(authorization, id);
        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/{id}/cancel")
    public ResponseEntity<CancelBookingResponse> cancelBooking(
            @RequestHeader("Authorization") String authorization,
            @PathVariable("id") UUID id,
            @Valid @RequestBody(required = false) CancelBookingRequest request) {
        // Create default request if not provided
        if (request == null) {
            request = new CancelBookingRequest();
            request.setReason("ยกเลิกการจอง");
        }
        CancelBookingResponse response = bookingService.cancelBooking(authorization, id, request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me/overview")
    public ResponseEntity<BookingOverviewResponse> getMyOverview(
            @RequestHeader("Authorization") String authorization,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        var res = bookingService.getMyOverview(authorization, status, page, size);
        return ResponseEntity.ok(res);
    }
}