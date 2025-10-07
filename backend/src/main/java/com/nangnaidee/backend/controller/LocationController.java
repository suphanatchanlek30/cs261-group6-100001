// src/main/java/com/nangnaidee/backend/controller/LocationController.java

package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.dto.*;
import com.nangnaidee.backend.service.LocationService;
import com.nangnaidee.backend.service.LocationQueryService;
import com.nangnaidee.backend.service.LocationUnitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.nangnaidee.backend.dto.UpdateLocationRequest;
import com.nangnaidee.backend.service.LocationUpdateService;
import com.nangnaidee.backend.service.LocationDeleteService;

import java.util.UUID;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class LocationController {

    private final LocationService locationService;
    private final LocationQueryService locationQueryService;
    private final LocationUnitService locationUnitService;
    private final LocationUpdateService locationUpdateService;
    private final LocationDeleteService locationDeleteService;

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

    // ค้นหาด้วย id
    @GetMapping("/{id}")
    public ResponseEntity<LocationDetailResponse> getOne(@PathVariable("id") UUID id) {
        LocationDetailResponse res = locationQueryService.getById(id);
        return ResponseEntity.ok(res); // 200 OK
    }

    // ---------- เพิ่มยูนิต ----------
    @PostMapping("/{locationId}/units")
    public ResponseEntity<CreateUnitResponse> createUnit(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable("locationId") UUID locationId,
            @Valid @RequestBody CreateUnitRequest request
    ) {
        CreateUnitResponse res = locationUnitService.createUnit(authorization, locationId, request);
        return ResponseEntity.status(201).body(res);
    }

    // PATCH /api/locations/{id}
    @PatchMapping("/{id}")
    public ResponseEntity<LocationDetailResponse> patch(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateLocationRequest request
    ) {
        LocationDetailResponse res = locationUpdateService.patch(authorization, id, request);
        return ResponseEntity.ok(res); // 200 OK – updated object
    }

    // -------- DELETE /api/locations/{id} --------
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiMessageResponse> delete(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable("id") UUID id
    ) {
        locationDeleteService.delete(authorization, id);
        return ResponseEntity.ok(new ApiMessageResponse("ลบสถานที่สำเร็จ"));
    }
}
