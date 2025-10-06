// src/main/java/com/nangnaidee/backend/controller/UnitController.java

package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.dto.OccupiedSlotsResponse;
import com.nangnaidee.backend.dto.UpdateUnitRequest;
import com.nangnaidee.backend.dto.UpdateUnitResponse;
import com.nangnaidee.backend.exception.BadRequestException;
import com.nangnaidee.backend.service.LocationUnitService;
import com.nangnaidee.backend.service.UnitAvailabilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/units")
@RequiredArgsConstructor
public class UnitController {

    private final LocationUnitService locationUnitService;
    private final UnitAvailabilityService unitAvailabilityService;

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

    // ---- NEW: Public GET /api/units/{unitId}/occupied ----
    @GetMapping("/{unitId}/occupied")
    public ResponseEntity<OccupiedSlotsResponse> getOccupied(
            @PathVariable("unitId") UUID unitId,
            @RequestParam("from") String fromStr,
            @RequestParam("to") String toStr
    ) {
        try {
            // กันเคสที่ '+' ถูก decode เป็น space มา: แปลง space ตรงหน้า offset กลับเป็น '+'
            // หมายเหตุ: ปกติควรให้ client encode ให้ถูกต้อง (%2B) แต่นี่คือ safety net
            fromStr = fromStr.replace(" ", "+");
            toStr   = toStr.replace(" ", "+");

            OffsetDateTime from = OffsetDateTime.parse(fromStr);
            OffsetDateTime to   = OffsetDateTime.parse(toStr);

            OccupiedSlotsResponse res = unitAvailabilityService.getOccupied(unitId, from, to);
            return ResponseEntity.ok(res);
        } catch (java.time.format.DateTimeParseException ex) {
            throw new BadRequestException("รูปแบบเวลาต้องเป็น ISO-8601 เช่น 2025-10-10T00:00:00%2B07:00 หรือใช้ Z (UTC)");
        }
    }
}