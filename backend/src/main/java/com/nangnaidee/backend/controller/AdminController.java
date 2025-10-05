package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.dto.GetPaymentResponse;
import com.nangnaidee.backend.dto.PatchPaymentRequest;
import com.nangnaidee.backend.dto.PatchPaymentResponse;
import com.nangnaidee.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/payments")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping
    public GetPaymentResponse getPayments(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return adminService.getPayments(authorizationHeader, status, page, size);
    }

  
    @PatchMapping("/{paymentId}/review")
    public ResponseEntity<PatchPaymentResponse> approvePayment(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable("paymentId") UUID paymentId,
            @RequestBody PatchPaymentRequest req
    ) {
        PatchPaymentResponse response = adminService.approvePayment(authorizationHeader, paymentId, req);
        return ResponseEntity.ok(response);
    }
}
