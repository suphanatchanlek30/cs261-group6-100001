// backend/src/main/java/com/nangnaidee/backend/controller/HostController.java

package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.dto.*;
import com.nangnaidee.backend.service.HostService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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

    /**
     * (7) Host เพิ่มยูนิตให้กับสถานที่
     * โค้ดตัวนี้จะทํางานได้ก็ต่อเมื่อเรามีการสร้างห้องแล้วนํา locationId มาใช้ และ Authorization ต้องถูกต้อง
     */
    @PostMapping("/locations/{locationId}/units")
    public ResponseEntity<CreateHostUnitResponse> createHostUnit(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable("locationId") UUID locationId,
            @Valid @RequestBody CreateHostUnitRequest request
    ) {
        CreateHostUnitResponse response = hostService.createHostUnit(authorization, locationId, request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * (8) Host แก้ไขยูนิตของตัวเอง 
     * โค้ดนี้ข้อแค่ Host ตรงกับเจ้าของยูนิตเท่านั้นถึงจะแก้ไขได้เท่านั้นก็ได้เลย
     */
    @PatchMapping("/units/{id}")
    public ResponseEntity<UpdateHostUnitResponse> updateHostUnit(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @PathVariable("id") UUID id,
            @Valid @RequestBody UpdateHostUnitRequest request
    ) {
        UpdateHostUnitResponse response = hostService.updateHostUnit(authorization, id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Host: ดึงข้อมูลการจองเฉพาะรายการ
     */
    @GetMapping("/bookings/{bookingId}")
    public ResponseEntity<GetBookingHostResponse> getBooking(
            @RequestHeader(name = "Authorization") String authorizationHeader,
            @PathVariable String bookingId) {
        GetBookingHostResponse response = hostService.getBooking(authorizationHeader, bookingId);
        return ResponseEntity.ok(response);
    }

    /**
     * Host: ดึงข้อมูลการจองทั้งหมด (พร้อมกรอง)
     */
    @GetMapping("/bookings")
    public ResponseEntity<Page<GetAllBookingHostResponse>> getAllBookings(
            @RequestHeader(name = "Authorization") String authorizationHeader,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) UUID locationId,
            @RequestParam(required = false) UUID unitId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sort) {

        Page<GetAllBookingHostResponse> response = hostService.getallBooking(
                authorizationHeader,
                status,
                locationId,
                unitId,
                from,
                to,
                page,
                size,
                sort);

        return ResponseEntity.ok(response);
    }

    /**
     * Host: สรุปรายได้ (Revenue Summary)
     */
    @GetMapping("/revenue/summary")
    public ResponseEntity<List<HostRevenueSummaryResponse>> getRevenueSummary(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "day") String groupBy) {
        
        return ResponseEntity.ok(hostService.getRevenueSummary(
            authorizationHeader, from, to, groupBy));
    }

    /**
     * Host: รายการธุรกรรมรายได้ (Revenue Transactions)
     */
    @GetMapping("/revenue/transactions")
    public ResponseEntity<Page<RevenueTransactionDto>> getRevenueTransactions(
            @RequestHeader("Authorization") String authorizationHeader,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(required = false) String method,
            @RequestParam(required = false) UUID locationId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        return ResponseEntity.ok(hostService.getRevenueTransactions(
            authorizationHeader, from, to, method, locationId, page, size));
    }

}