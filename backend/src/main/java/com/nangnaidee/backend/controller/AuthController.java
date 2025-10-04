// src/main/java/com/nangnaidee/backend/controller/AuthController.java
package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.dto.*;
import com.nangnaidee.backend.dto.RegisterRequest;
import com.nangnaidee.backend.dto.RegisterResponse;
import com.nangnaidee.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.nangnaidee.backend.dto.MeResponse;


@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {


    private final AuthService authService;


    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@Valid @RequestBody RegisterRequest request) {
        RegisterResponse response = authService.register(request);
        return ResponseEntity.status(201).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<MeResponse> me(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        MeResponse response = authService.me(authorization);
        return ResponseEntity.ok(response);
    }
}