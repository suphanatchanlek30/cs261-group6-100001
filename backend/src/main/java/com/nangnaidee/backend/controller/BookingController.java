package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.dto.BookingListResponse;
import com.nangnaidee.backend.dto.CreateBookingRequest;
import com.nangnaidee.backend.dto.CreateBookingResponse;
import com.nangnaidee.backend.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

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
}