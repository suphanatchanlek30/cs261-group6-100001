// backend/src/main/java/com/nangnaidee/backend/controller/HostController.java

package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.dto.CreateDraftLocationResponse;
import com.nangnaidee.backend.dto.CreateLocationRequest;
import com.nangnaidee.backend.dto.MeResponse;
import com.nangnaidee.backend.service.HostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.nangnaidee.backend.dto.HostLocationListItem;
import com.nangnaidee.backend.dto.HostLocationDetailResponse;
import org.springframework.web.bind.annotation.PathVariable;
import com.nangnaidee.backend.dto.UpdateLocationRequest;
import com.nangnaidee.backend.dto.SubmitReviewResponse; // (เพิ่ม)

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/hosts")
@RequiredArgsConstructor
public class HostController {

    private final HostService hostService;

    /**
     * (1/6) ดึงโปรไฟล์ของ Host
     */
    @GetMapping("/me")
    public ResponseEntity<MeResponse> getHostProfile(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        MeResponse response = hostService.getHostProfile(authorization);
        return ResponseEntity.ok(response);
    }

    /**
     * (2/6) สร้าง Location ฉบับร่าง (DRAFT)
     */
    @PostMapping("/locations")
    public ResponseEntity<CreateDraftLocationResponse> createDraftLocation(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @Valid @RequestBody CreateLocationRequest request
    ) {
        CreateDraftLocationResponse response = hostService.createDraftLocation(authorization, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * (3/6) ดึงรายการสถานที่ของ Host (My Locations)
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
     * (4/6) ดึงรายละเอียดสถานที่ของ Host (เฉพาะเจ้าของ)
     */
    @GetMapping("/locations/{id}")
    public ResponseEntity<HostLocationDetailResponse> getMyLocationDetail(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable("id") UUID id
    ) {
        HostLocationDetailResponse response = hostService.getMyLocationDetail(authorization, id);
        return ResponseEntity.ok(response);
    }

    /**
     * (5/6) Host แก้ไข Draft/Rejected Location
     */
    @PatchMapping("/locations/{id}")
    public ResponseEntity<HostLocationDetailResponse> updateDraftLocation(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateLocationRequest request
    ) {
        HostLocationDetailResponse response = hostService.updateDraftLocation(authorization, id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * (6/6) Host ส่ง Draft/Rejected Location เพื่อขออนุมัติ
     */
    @PostMapping("/locations/{id}/submit")
    public ResponseEntity<SubmitReviewResponse> submitForReview(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable("id") UUID id
    ) {
        SubmitReviewResponse response = hostService.submitForReview(authorization, id);
        return ResponseEntity.ok(response);
    }
}