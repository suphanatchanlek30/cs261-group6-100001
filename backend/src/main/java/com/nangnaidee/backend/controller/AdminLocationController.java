package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.dto.PatchLocationStatusRequest;
import com.nangnaidee.backend.dto.PatchLocationStatusResponse;
import com.nangnaidee.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/locations")
@RequiredArgsConstructor
public class AdminLocationController {

    private final AdminService adminService;

    @PatchMapping("/{id}/status")
    public ResponseEntity<PatchLocationStatusResponse> updateLocationStatus(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable UUID id,
            @RequestBody PatchLocationStatusRequest request
    ) {
        PatchLocationStatusResponse response = adminService.updateLocationStatus(authorizationHeader, id, request);
        return ResponseEntity.ok(response);
    }
}