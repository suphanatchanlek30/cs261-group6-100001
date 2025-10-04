package com.nangnaidee.backend.controller;

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
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody CreateBookingRequest request) {
        CreateBookingResponse res = bookingService.create(authorization, request);
        return ResponseEntity.created(URI.create("/api/bookings/" + res.getId())).body(res);
    }
}