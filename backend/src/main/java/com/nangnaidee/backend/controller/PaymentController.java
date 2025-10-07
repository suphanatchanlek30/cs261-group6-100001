// src/main/java/com/nangnaidee/backend/controller/PaymentController.java

package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.dto.CreatePaymentRequest;
import com.nangnaidee.backend.dto.CreatePaymentResponse;
import com.nangnaidee.backend.dto.ProofPaymentRequest;
import com.nangnaidee.backend.dto.ProofPaymentResponse;
import com.nangnaidee.backend.service.PaymentService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<CreatePaymentResponse> createPayment(
            @RequestHeader("Authorization") String authorizationHeader,
            @Valid @RequestBody CreatePaymentRequest req) {
        CreatePaymentResponse res = paymentService.create(authorizationHeader, req);
        return ResponseEntity.status(201).body(res);
    }

    @PostMapping("/{paymentId}/proof")
    public ResponseEntity<ProofPaymentResponse> uploadProof(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable UUID paymentId,
            @Valid @RequestBody ProofPaymentRequest req) {
        ProofPaymentResponse res = paymentService.proof(authorizationHeader, paymentId, req);
        return ResponseEntity.ok(res);
    }

}
