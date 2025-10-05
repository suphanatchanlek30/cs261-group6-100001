package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.dto.UpdateUnitRequest;
import com.nangnaidee.backend.dto.UpdateUnitResponse;
import com.nangnaidee.backend.service.LocationUnitService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/units")
@RequiredArgsConstructor
public class UnitController {
    private final LocationUnitService locationUnitService;

    @PatchMapping("/{id}")
    public ResponseEntity<UpdateUnitResponse> updateUnit(
            @RequestHeader("Authorization") String authorization,
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateUnitRequest request) {
        UpdateUnitResponse response = locationUnitService.updateUnit(authorization, id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUnit(
            @RequestHeader("Authorization") String authorization,
            @PathVariable("id") UUID id) {
        locationUnitService.deleteUnit(authorization, id);
        return ResponseEntity.noContent().build(); // 204 No Content
    }
}