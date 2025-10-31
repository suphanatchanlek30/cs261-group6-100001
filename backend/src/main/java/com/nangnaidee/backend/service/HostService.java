// backend/src/main/java/com/nangnaidee/backend/service/HostService.java

package com.nangnaidee.backend.service;

import com.nangnaidee.backend.config.JwtTokenProvider;
import com.nangnaidee.backend.dto.CreateDraftLocationResponse; // (เพิ่ม)
import com.nangnaidee.backend.dto.CreateLocationRequest;   // (เพิ่ม)
import com.nangnaidee.backend.dto.MeResponse;
import com.nangnaidee.backend.exception.ForbiddenException;
import com.nangnaidee.backend.exception.UnauthorizedException;
import com.nangnaidee.backend.model.Location; // (เพิ่ม)
import com.nangnaidee.backend.model.Role;
import com.nangnaidee.backend.model.User;
import com.nangnaidee.backend.repo.LocationRepository; // (เพิ่ม)
import com.nangnaidee.backend.repo.UserRepository;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // (เพิ่ม)
import com.nangnaidee.backend.dto.HostLocationListItem; // (เพิ่ม)
import com.nangnaidee.backend.dto.HostLocationDetailResponse; // (เพิ่ม)
import com.nangnaidee.backend.exception.NotFoundException; // (เพิ่ม)
import com.nangnaidee.backend.model.LocationUnit; // (เพิ่ม)
import com.nangnaidee.backend.repo.LocationUnitRepository; // (เพิ่ม)

import java.util.List; // (เพิ่ม)

import java.util.List;
import java.util.Set;
import java.util.UUID; // (เพิ่ม)
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HostService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final LocationRepository locationRepository; // (เพิ่ม)
    private final LocationUnitRepository locationUnitRepository; // (เพิ่ม)

    /**
     * ดึงข้อมูลโปรไฟล์ /me ของ Host
     * @param authorizationHeader "Bearer <token>"
     * @return MeResponse
     * @throws UnauthorizedException (401) หาก Token ไม่มี, ผิดรูปแบบ หรือหมดอายุ
     * @throws ForbiddenException (403) หาก Token ถูกต้อง แต่ไม่ใช่ Role "HOST"
     */
    public MeResponse getHostProfile(String authorizationHeader) {
        // 1. ตรวจสอบ Authn (เหมือน AuthService.me)
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
                .orElseThrow(() -> new UnauthorizedException("ไม่พบผู้ใช้ (Token อาจถูกเพิกถอน)"));

        // 2. ตรวจสอบ Authz (จุดที่ต่างจาก AuthService.me)
        Set<String> roleCodes = user.getRoles().stream()
                .map(Role::getCode)
                .collect(Collectors.toSet());

        if (!roleCodes.contains("HOST")) {
            // ถ้าล็อกอินมา แต่ไม่ใช่ HOST -> 403 Forbidden
            throw new ForbiddenException("ต้องเป็นผู้ใช้ที่มีสิทธิ์ HOST เท่านั้น");
        }

        // 3. ถ้าเป็น HOST จริง ให้คืนข้อมูลโปรไฟล์ (เหมือน AuthService.me)
        List<String> rolesList = roleCodes.stream().toList();

        return new MeResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                rolesList
        );
    }

    /**
     * (เมธอดใหม่) สร้าง Location ฉบับร่าง (DRAFT) สำหรับ HOST
     * @param authorizationHeader "Bearer <token>"
     * @param request ข้อมูล Location ที่ต้องการสร้าง
     * @return CreateDraftLocationResponse
     */
    @Transactional // (เพิ่ม)
    public CreateDraftLocationResponse createDraftLocation(String authorizationHeader, CreateLocationRequest request) {
        // 1. ตรวจสอบ Authn และ Authz (ต้องเป็น HOST เท่านั้น)
        // เราสามารถเรียกใช้เมธอดเดิมเพื่อยืนยันตัวตนและสิทธิ์ได้
        MeResponse hostProfile = getHostProfile(authorizationHeader);
        User hostOwner = userRepository.findById(hostProfile.getId()).get(); // ดึง User entity ของ Host

        // 2. สร้าง Location Entity
        Location loc = new Location();
        loc.setId(UUID.randomUUID());
        loc.setOwner(hostOwner); // เจ้าของคือ HOST ที่ล็อกอินเข้ามา
        loc.setName(request.getName());
        loc.setDescription(request.getDescription());
        loc.setAddressText(request.getAddress());
        loc.setGeoLat(request.getGeoLat());
        loc.setGeoLng(request.getGeoLng());
        loc.setCoverImageUrl(request.getCoverImageUrl());

        // 3. ⭐️ จุดสำคัญ: ตั้งค่าเป็น DRAFT (ไม่ Active)
        // เราจะใช้ field `is_active` เป็นตัวกำหนด
        // DRAFT = false, PUBLISHED = true
        loc.setActive(false);

        // 4. บันทึกและคืนค่า Response DTO ใหม่
        Location saved = locationRepository.save(loc);

        return new CreateDraftLocationResponse(saved.getId(), "DRAFT");
    }

    /**
     * (เมธอดใหม่) ดึงรายการสถานที่ของ Host ที่ล็อกอินอยู่
     * @param authorizationHeader "Bearer <token>"
     * @param status (Optional) "DRAFT" หรือ "APPROVED"
     * @return List<HostLocationListItem>
     */
    @Transactional(readOnly = true)
    public List<HostLocationListItem> getMyLocations(String authorizationHeader, String status) {
        // 1. ยืนยันตัวตนว่าเป็น HOST
        MeResponse hostProfile = getHostProfile(authorizationHeader);
        Integer hostId = hostProfile.getId();

        // 2. ดึงข้อมูล Location จากฐานข้อมูล
        List<Location> locations;
        String statusUpper = (status == null) ? null : status.trim().toUpperCase();

        if ("DRAFT".equals(statusUpper)) {
            // ดึงเฉพาะ Draft (isActive = false)
            locations = locationRepository.findByOwnerIdAndIsActiveOrderByCreatedAtDesc(hostId, false);
        } else if ("APPROVED".equals(statusUpper)) {
            // ดึงเฉพาะ Approved (isActive = true)
            locations = locationRepository.findByOwnerIdAndIsActiveOrderByCreatedAtDesc(hostId, true);
        } else {
            // ไม่ระบุ status หรือ status ไม่ตรง (เช่น PENDING)
            // ให้ดึงทั้งหมดที่เป็นของ Host คนนี้
            locations = locationRepository.findByOwnerIdOrderByCreatedAtDesc(hostId);
        }

        // 3. แปลง Entity -> DTO
        return locations.stream()
                .map(loc -> new HostLocationListItem(
                        loc.getId(),
                        loc.getName(),
                        loc.getAddressText(),
                        loc.getCoverImageUrl(),
                        loc.isActive() ? "APPROVED" : "DRAFT" // แปลง boolean เป็น String
                ))
                .toList();
    }

    /**
     * (เมธอดใหม่) ดึงรายละเอียดสถานที่ของ Host (เฉพาะเจ้าของ)
     */
    @Transactional(readOnly = true)
    public HostLocationDetailResponse getMyLocationDetail(String authorizationHeader, UUID locationId) {
        // 1. ยืนยันตัวตนว่าเป็น HOST
        MeResponse hostProfile = getHostProfile(authorizationHeader);
        Integer hostId = hostProfile.getId();

        // 2. ค้นหาสถานที่
        Location loc = locationRepository.findById(locationId)
                .orElseThrow(() -> new NotFoundException("ไม่พบสถานที่")); // 404

        // 3. ⭐️ ตรวจสอบสิทธิ์เจ้าของ
        if (!loc.getOwner().getId().equals(hostId)) {
            // ถ้า ID เจ้าของไม่ตรงกับ ID ของ Host ที่ล็อกอิน
            throw new ForbiddenException("คุณไม่ใช่เจ้าของสถานที่นี้"); // 403
        }

        // 4. ค้นหา Units ที่อยู่ภายใต้ Location นี้
        List<LocationUnit> units = locationUnitRepository.findByLocation_IdOrderByCodeAsc(locationId);
        List<HostLocationDetailResponse.UnitItem> unitItems = units.stream()
                .map(u -> new HostLocationDetailResponse.UnitItem(
                        u.getId(), u.getCode(), u.getName(),
                        u.getImageUrl(), u.getShortDesc(),
                        u.getCapacity(), u.getPriceHourly(), u.isActive()
                ))
                .toList();

        // 5. แปลงสถานะ (Status Logic)
        String publishStatus;
        if (loc.isActive()) {
            publishStatus = "APPROVED";
        } else if (loc.getRejectReason() != null && !loc.getRejectReason().isBlank()) {
            publishStatus = "REJECTED";
        } else {
            publishStatus = "DRAFT";
        }

        // 6. ประกอบร่าง DTO ตอบกลับ
        return new HostLocationDetailResponse(
                loc.getId(),
                loc.getName(),
                loc.getDescription(),
                loc.getAddressText(),
                loc.getGeoLat(),
                loc.getGeoLng(),
                loc.getCoverImageUrl(),
                loc.getCreatedAt(),
                publishStatus,
                loc.getRejectReason(), // ถ้าเป็น null, DTO จะตัดออกเอง
                loc.isActive(),
                unitItems
        );
    }
}