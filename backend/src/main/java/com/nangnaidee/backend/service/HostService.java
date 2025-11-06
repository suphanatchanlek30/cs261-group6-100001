// backend/src/main/java/com/nangnaidee/backend/service/HostService.java

package com.nangnaidee.backend.service;

import com.nangnaidee.backend.config.JwtTokenProvider;
import com.nangnaidee.backend.dto.*;
import com.nangnaidee.backend.exception.ForbiddenException;
import com.nangnaidee.backend.exception.NotFoundException;
import com.nangnaidee.backend.exception.UnauthorizedException;
import com.nangnaidee.backend.exception.UnprocessableEntityException;
import com.nangnaidee.backend.model.Location;
import com.nangnaidee.backend.model.LocationUnit;
import com.nangnaidee.backend.model.Role;
import com.nangnaidee.backend.model.User;
import com.nangnaidee.backend.repo.LocationRepository;
import com.nangnaidee.backend.repo.LocationUnitRepository;
import com.nangnaidee.backend.repo.UserRepository;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HostService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final LocationRepository locationRepository;
    private final LocationUnitRepository locationUnitRepository;

    // ⭐️ ใช้ค่าคงที่พิเศษเพื่อระบุสถานะ "รอตรวจสอบ"
    private static final String PENDING_REVIEW_MARKER = "__PENDING__";

    /**
     * Helper กลางสำหรับแปลง Entity เป็น Status String
     */
    private String getPublishStatus(Location loc) {
        if (loc.isActive()) {
            return "APPROVED"; // 1. อนุมัติแล้ว (isActive = true)
        }

        String reason = loc.getRejectReason();
        if (reason == null) {
            return "DRAFT"; // 2. ร่าง (isActive = false, reason = null)
        }
        if (PENDING_REVIEW_MARKER.equals(reason)) {
            return "PENDING_REVIEW"; // 3. รอตวรจสอบ (isActive = false, reason = "__PENDING__")
        }

        return "REJECTED"; // 4. ถูกปฏิเสธ (isActive = false, reason = "มีข้อความ")
    }

    /**
     * Helper ยืนยันตัวตน Host (ใช้ภายใน Service นี้)
     */
    private User getAuthenticatedHost(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("ต้องส่งโทเคนแบบ Bearer");
        }
        String token = authorizationHeader.substring("Bearer ".length()).trim();
        Integer userId;
        try {
            userId = jwtTokenProvider.getUserId(token);
        } catch (JwtException | IllegalArgumentException e) {
            throw new UnauthorizedException("โทเคนไม่ถูกต้องหรือหมดอายุ");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("ไม่พบผู้ใช้"));
        Set<String> roleCodes = user.getRoles().stream()
                .map(Role::getCode)
                .collect(Collectors.toSet());
        if (!roleCodes.contains("HOST")) {
            throw new ForbiddenException("ต้องเป็นผู้ใช้ที่มีสิทธิ์ HOST เท่านั้น");
        }
        return user;
    }

    /**
     * (1/6) ดึงข้อมูลโปรไฟล์ /me ของ Host
     */
    public MeResponse getHostProfile(String authorizationHeader) {
        User host = getAuthenticatedHost(authorizationHeader);
        List<String> rolesList = host.getRoles().stream()
                .map(Role::getCode)
                .toList();

        return new MeResponse(
                host.getId(),
                host.getEmail(),
                host.getFullName(),
                rolesList
        );
    }

    /**
     * (2/6) สร้าง Location ฉบับร่าง (DRAFT) สำหรับ HOST
     */
    @Transactional
    public CreateDraftLocationResponse createDraftLocation(String authorizationHeader, CreateLocationRequest request) {
        User hostOwner = getAuthenticatedHost(authorizationHeader);

        Location loc = new Location();
        loc.setId(UUID.randomUUID());
        loc.setOwner(hostOwner);
        loc.setName(request.getName());
        loc.setDescription(request.getDescription());
        loc.setAddressText(request.getAddress());
        loc.setGeoLat(request.getGeoLat());
        loc.setGeoLng(request.getGeoLng());
        loc.setCoverImageUrl(request.getCoverImageUrl());
        loc.setActive(false); // DRAFT เริ่มที่ false
        // rejectReason เป็น null โดยอัตโนมัติ (สถานะ DRAFT)

        Location saved = locationRepository.save(loc);

        return new CreateDraftLocationResponse(saved.getId(), "DRAFT");
    }

    /**
     * (3/6) ดึงรายการสถานที่ของ Host (My Locations)
     */
    @Transactional(readOnly = true)
    public List<HostLocationListItem> getMyLocations(String authorizationHeader, String status) {
        User host = getAuthenticatedHost(authorizationHeader);
        Integer hostId = host.getId();

        List<Location> locations = locationRepository.findByOwnerIdOrderByCreatedAtDesc(hostId);
        String statusUpper = (status == null) ? null : status.trim().toUpperCase();

        return locations.stream()
                .map(loc -> new HostLocationListItem(
                        loc.getId(),
                        loc.getName(),
                        loc.getAddressText(),
                        loc.getCoverImageUrl(),
                        getPublishStatus(loc) // 👈 ใช้ Helper ใหม่
                ))
                .filter(item -> { // กรองด้วย status ที่แปลงแล้ว
                    if (statusUpper == null || statusUpper.isBlank()) {
                        return true; // ไม่กรอง
                    }
                    return item.getStatus().equals(statusUpper);
                })
                .toList();
    }

    /**
     * (4/6) ดึงรายละเอียดสถานที่ของ Host (เฉพาะเจ้าของ)
     */
    @Transactional(readOnly = true)
    public HostLocationDetailResponse getMyLocationDetail(String authorizationHeader, UUID locationId) {
        User host = getAuthenticatedHost(authorizationHeader);
        Location loc = locationRepository.findById(locationId)
                .orElseThrow(() -> new NotFoundException("ไม่พบสถานที่")); // 404

        if (!loc.getOwner().getId().equals(host.getId())) {
            throw new ForbiddenException("คุณไม่ใช่เจ้าของสถานที่นี้"); // 403
        }

        List<LocationUnit> units = locationUnitRepository.findByLocation_IdOrderByCodeAsc(locationId);
        List<HostLocationDetailResponse.UnitItem> unitItems = units.stream()
                .map(u -> new HostLocationDetailResponse.UnitItem(
                        u.getId(), u.getCode(), u.getName(),
                        u.getImageUrl(), u.getShortDesc(),
                        u.getCapacity(), u.getPriceHourly(), u.isActive()
                ))
                .toList();

        String publishStatus = getPublishStatus(loc); // 👈 ใช้ Helper ใหม่

        return new HostLocationDetailResponse(
                loc.getId(), loc.getName(), loc.getDescription(), loc.getAddressText(),
                loc.getGeoLat(), loc.getGeoLng(), loc.getCoverImageUrl(), loc.getCreatedAt(),
                publishStatus,
                "REJECTED".equals(publishStatus) ? loc.getRejectReason() : null, // 👈 แสดงเหตุผลเมื่อ Rejected เท่านั้น
                loc.isActive(),
                unitItems
        );
    }

    /**
     * (5/6) แก้ไข Location ฉบับร่าง (DRAFT / REJECTED)
     */
    @Transactional
    public HostLocationDetailResponse updateDraftLocation(String authorizationHeader, UUID locationId, UpdateLocationRequest request) {
        User host = getAuthenticatedHost(authorizationHeader);
        Location loc = locationRepository.findById(locationId)
                .orElseThrow(() -> new NotFoundException("ไม่พบสถานที่"));

        if (!loc.getOwner().getId().equals(host.getId())) {
            throw new ForbiddenException("คุณไม่ใช่เจ้าของสถานที่นี้");
        }

        String currentStatus = getPublishStatus(loc); // 👈 ใช้ Helper ใหม่

        // ⭐️ ตรวจสอบ Logic 422
        if ("APPROVED".equals(currentStatus)) {
            throw new UnprocessableEntityException("ไม่สามารถแก้ไขสถานที่ที่ได้รับการอนุมัติ (APPROVED) แล้ว");
        }
        if ("PENDING_REVIEW".equals(currentStatus)) {
            throw new UnprocessableEntityException("ไม่สามารถแก้ไขสถานที่ที่กำลังรอการตรวจสอบ (PENDING_REVIEW)");
        }
        // (อนุญาต DRAFT และ REJECTED)

        boolean changed = false;
        if (request.getName() != null) { loc.setName(request.getName()); changed = true; }
        if (request.getDescription() != null) { loc.setDescription(request.getDescription()); changed = true; }
        if (request.getAddress() != null) { loc.setAddressText(request.getAddress()); changed = true; }
        if (request.getGeoLat() != null) { loc.setGeoLat(request.getGeoLat()); changed = true; }
        if (request.getGeoLng() != null) { loc.setGeoLng(request.getGeoLng()); changed = true; }
        if (request.getCoverImageUrl() != null) { loc.setCoverImageUrl(request.getCoverImageUrl()); changed = true; }

        if (request.getIsActive() != null) {
            throw new UnprocessableEntityException("กรุณาใช้ปุ่ม 'Submit for Review' (POST .../submit) เพื่อส่งเผยแพร่");
        }

        // ⭐️ ถ้าแก้ REJECTED มันจะกลับไปเป็น DRAFT
        if ("REJECTED".equals(currentStatus) && changed) {
            loc.setRejectReason(null); // ล้างเหตุผลทิ้ง
        }

        if (!changed) {
            throw new UnprocessableEntityException("ไม่พบข้อมูลที่ต้องการอัปเดต");
        }

        locationRepository.save(loc);

        // คืนค่าที่อัปเดตแล้ว (สถานะจะกลายเป็น DRAFT ถ้าเคย REJECTED)
        return getMyLocationDetail(authorizationHeader, locationId);
    }

    /**
     * (6/6) ส่ง DRAFT/REJECTED location เพื่อ Review
     */
    @Transactional
    public SubmitReviewResponse submitForReview(String authorizationHeader, UUID locationId) {
        User host = getAuthenticatedHost(authorizationHeader);
        Location loc = locationRepository.findById(locationId)
                .orElseThrow(() -> new NotFoundException("ไม่พบสถานที่")); // 404

        if (!loc.getOwner().getId().equals(host.getId())) {
            throw new ForbiddenException("คุณไม่ใช่เจ้าของสถานที่นี้"); // 403
        }

        String currentStatus = getPublishStatus(loc);

        switch (currentStatus) {
            case "APPROVED":
                throw new UnprocessableEntityException("สถานที่นี้ได้รับการอนุมัติแล้ว");
            case "PENDING_REVIEW":
                throw new UnprocessableEntityException("สถานที่นี้กำลังรอการตรวจสอบอยู่แล้ว");

            case "DRAFT":
            case "REJECTED":
                // นี่คือสถานะที่ถูกต้อง
                loc.setActive(false);
                loc.setRejectReason(PENDING_REVIEW_MARKER); // 👈 ตั้งค่าสถานะเป็น PENDING
                locationRepository.save(loc);
                return new SubmitReviewResponse("PENDING_REVIEW");

            default:
                throw new IllegalStateException("พบสถานะที่ไม่รู้จัก: " + currentStatus);
        }
    }

    /**
     * (7) เพิ่มยูนิตให้กับ Location ของ Host
     */
    @Transactional
    public CreateHostUnitResponse createHostUnit(String authorizationHeader, UUID locationId, CreateHostUnitRequest request) {
        User host = getAuthenticatedHost(authorizationHeader);
        
        // ตรวจสอบว่า location มีอยู่และเป็นของ host
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new NotFoundException("ไม่พบสถานที่")); // 404

        if (!location.getOwner().getId().equals(host.getId())) {
            throw new ForbiddenException("คุณไม่ใช่เจ้าของสถานที่นี้"); // 403
        }

        // ตรวจสอบ code ซ้ำในสถานที่เดียวกัน
        if (locationUnitRepository.existsByLocation_IdAndCodeIgnoreCase(locationId, request.getCode())) {
            throw new UnprocessableEntityException("รหัสยูนิต '" + request.getCode() + "' มีอยู่แล้วในสถานที่นี้"); // 409 conflict
        }

        // สร้าง LocationUnit ใหม่
        LocationUnit unit = new LocationUnit();
        unit.setId(UUID.randomUUID());
        unit.setLocation(location);
        unit.setCode(request.getCode());
        unit.setName(request.getName());
        unit.setImageUrl(request.getImageUrl());
        unit.setShortDesc(request.getShortDesc());
        unit.setCapacity(request.getCapacity());
        unit.setPriceHourly(request.getPriceHourly());
        unit.setActive(true); // เริ่มต้นเป็น active

        LocationUnit savedUnit = locationUnitRepository.save(unit);

        // ตามความต้องการ publishStatus จะเป็น "INHERIT" เสมอ
        // หมายความว่ายูนิตจะแสดงตาม status ของ location
        return new CreateHostUnitResponse(savedUnit.getId(), "INHERIT");
    }

    //โค้คตัวนี้มีไว้สําหรับการสร้างหน่วยที่พัก (Host Unit) ใหม่ภายใต้สถานที่ที่ระบุ โดยตรวจสอบสิทธิ์ของผู้ใช้และความถูกต้องของข้อมูลก่อนที่จะสร้างยูนิตใหม่และตอบกลับด้วย ID และสถานะการเผยแพร่ของยูนิตนั้น
    // 1. ยืนยันตัวตนของผู้ใช้และตรวจสอบว่าเป็นเจ้าของสถานที่
    // 2. ตรวจว่ามีสถานที่นั้นจริงหรือไม่ LocationId
    // 3. ตรวจสอบว่ารหัสยูนิต (code) ไม่ซ้ำกับยูนิตอื่นในสถานที่เดียวกัน
    // 4. สร้าง LocationUnit ใหม่ด้วยข้อมูลจากคำขอ
    // 5. บันทึกยูนิตลงในฐานข้อมูล
    // 6. ส่งกลับ CreateHostUnitResponse ที่มี ID ของยูนิตและสถานะการเผยแพร่เป็น "INHERIT"
}