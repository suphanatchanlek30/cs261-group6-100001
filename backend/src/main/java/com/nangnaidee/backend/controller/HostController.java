// backend/src/main/java/com/nangnaidee/backend/controller/HostController.java

package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.dto.CreateDraftLocationResponse; // (เพิ่ม)
import com.nangnaidee.backend.dto.CreateLocationRequest;       // (เพิ่ม)
import com.nangnaidee.backend.dto.MeResponse;
import com.nangnaidee.backend.service.HostService;
import jakarta.validation.Valid; // (เพิ่ม)
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus; // (เพิ่ม)
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*; // (อัปเดต)
import com.nangnaidee.backend.dto.HostLocationListItem; // (เพิ่ม)
import com.nangnaidee.backend.dto.HostLocationDetailResponse; // (เพิ่ม)
import org.springframework.web.bind.annotation.PathVariable; // (เพิ่ม)

import java.util.List; // (เพิ่ม)
import java.util.UUID; // (เพิ่ม)

@RestController
@RequestMapping("/api/hosts")
@RequiredArgsConstructor
public class HostController {

    private final HostService hostService;

    /**
     * ดึงโปรไฟล์ของ Host ที่ล็อกอินอยู่ (สำหรับ Onboarding)
     */
    @GetMapping("/me")
    public ResponseEntity<MeResponse> getHostProfile(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        MeResponse response = hostService.getHostProfile(authorization);
        return ResponseEntity.ok(response);
    }

    /**
     * (Endpoint ใหม่) สร้าง Location ฉบับร่าง (DRAFT)
     */
    @PostMapping("/locations")
    public ResponseEntity<CreateDraftLocationResponse> createDraftLocation(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody CreateLocationRequest request
    ) {
        CreateDraftLocationResponse response = hostService.createDraftLocation(authorization, request);
        // คืนค่า 201 Created
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * (Endpoint ใหม่) ดึงรายการสถานที่ของ Host (My Locations)
     */
    @GetMapping("/locations")
    public ResponseEntity<List<HostLocationListItem>> getMyLocations(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam(value = "status", required = false) String status
    ) {
        List<HostLocationListItem> response = hostService.getMyLocations(authorization, status);
        return ResponseEntity.ok(response);
    }

    /**
     * (Endpoint ใหม่) ดึงรายละเอียดสถานที่ของ Host (เฉพาะเจ้าของ)
     */
    @GetMapping("/locations/{id}")
    public ResponseEntity<HostLocationDetailResponse> getMyLocationDetail(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable("id") UUID id
    ) {
        HostLocationDetailResponse response = hostService.getMyLocationDetail(authorization, id);
        return ResponseEntity.ok(response);
    }
}