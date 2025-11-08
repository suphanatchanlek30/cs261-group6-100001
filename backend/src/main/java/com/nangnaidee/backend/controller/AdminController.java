// src/main/java/com/nangnaidee/backend/controller/AdminController.java

package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.dto.AdminLocationReviewRequest;
import com.nangnaidee.backend.dto.AdminLocationReviewResponse;
import com.nangnaidee.backend.dto.GetPaymentResponse;
import com.nangnaidee.backend.dto.LocationReviewQueueResponse;
import com.nangnaidee.backend.dto.PatchPaymentRequest;
import com.nangnaidee.backend.dto.PatchPaymentResponse;
import com.nangnaidee.backend.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/payments")
    public GetPaymentResponse getPayments(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return adminService.getPayments(authorizationHeader, status, page, size);
    }

    @GetMapping("/locations/reviews")
    public ResponseEntity<LocationReviewQueueResponse> getLocationReviews(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Integer hostId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        LocationReviewQueueResponse response = adminService.getLocationReviews(authorizationHeader, q, hostId, page, size);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/locations/{id}/review")
    public ResponseEntity<AdminLocationReviewResponse> reviewLocation(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable("id") UUID id,
            @Valid @RequestBody AdminLocationReviewRequest request
    ) {
        AdminLocationReviewResponse response = adminService.reviewLocation(authorizationHeader, id, request);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/payments/{paymentId}/review")
    public ResponseEntity<PatchPaymentResponse> approvePayment(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable("paymentId") UUID paymentId,
            @RequestBody PatchPaymentRequest req
    ) {
        PatchPaymentResponse response = adminService.approvePayment(authorizationHeader, paymentId, req);
        return ResponseEntity.ok(response);
    }
}
