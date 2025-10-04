// src/main/java/com/nangnaidee/backend/controller/LocationController.java
package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.dto.CreateLocationRequest;
import com.nangnaidee.backend.dto.CreateLocationResponse;
import com.nangnaidee.backend.dto.LocationDetailResponse;
import com.nangnaidee.backend.dto.LocationListResponse;
import com.nangnaidee.backend.service.LocationService;
import com.nangnaidee.backend.service.LocationQueryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;
    private final LocationQueryService locationQueryService;

    @PostMapping
    public ResponseEntity<CreateLocationResponse> create(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody CreateLocationRequest request
    ) {
        CreateLocationResponse res = locationService.create(authorization, request);
        return ResponseEntity.status(201).body(res);
    }

    @GetMapping
    public ResponseEntity<LocationListResponse> search(
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "near", required = false) String near,
            @RequestParam(value = "radiusKm", required = false) Double radiusKm,
            @RequestParam(value = "page", required = false) Integer page,
            @RequestParam(value = "size", required = false) Integer size
    ) {
        LocationListResponse res = locationQueryService.search(q, near, radiusKm, page, size);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LocationDetailResponse> getOne(@PathVariable("id") UUID id) {
        LocationDetailResponse res = locationQueryService.getById(id);
        return ResponseEntity.ok(res); // 200 OK
    }
}
