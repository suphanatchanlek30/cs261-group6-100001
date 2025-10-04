// src/main/java/com/nangnaidee/backend/controller/LocationController.java
package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.dto.CreateLocationRequest;
import com.nangnaidee.backend.dto.CreateLocationResponse;
import com.nangnaidee.backend.service.LocationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;

    @PostMapping
    public ResponseEntity<CreateLocationResponse> create(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody CreateLocationRequest request
    ) {
        CreateLocationResponse res = locationService.create(authorization, request);
        return ResponseEntity.status(201).body(res);
    }
}
