// backend/src/main/java/com/nangnaidee/backend/service/HostService.java

package com.nangnaidee.backend.service;

import com.nangnaidee.backend.config.JwtTokenProvider;
import com.nangnaidee.backend.dto.*;
import com.nangnaidee.backend.exception.ForbiddenException;
import com.nangnaidee.backend.exception.NotFoundException;
import com.nangnaidee.backend.exception.UnauthorizedException;
import com.nangnaidee.backend.exception.UnprocessableEntityException;
import com.nangnaidee.backend.model.*;
import com.nangnaidee.backend.repo.LocationRepository;
import com.nangnaidee.backend.repo.LocationUnitRepository;
import com.nangnaidee.backend.repo.LocationHoursRepository;
import com.nangnaidee.backend.repo.LocationBlockRepository;
import com.nangnaidee.backend.repo.UnitBlockRepository;
import com.nangnaidee.backend.repo.UserRepository;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HostService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final LocationRepository locationRepository;
    private final LocationUnitRepository locationUnitRepository;
    private final LocationHoursRepository locationHoursRepository;
    private final LocationBlockRepository locationBlockRepository;
    private final UnitBlockRepository unitBlockRepository;

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

    /**
     * (8) แก้ไขยูนิตของ Host
     */
    @Transactional
    public UpdateHostUnitResponse updateHostUnit(String authorizationHeader, UUID unitId, UpdateHostUnitRequest request) {
        User host = getAuthenticatedHost(authorizationHeader);
        
        // ค้นหา unit และตรวจสอบสิทธิ์
        LocationUnit unit = locationUnitRepository.findById(unitId)
                .orElseThrow(() -> new NotFoundException("ไม่พบยูนิต")); // 404

        // ตรวจสอบว่า host เป็นเจ้าของ location ของ unit นี้
        if (!unit.getLocation().getOwner().getId().equals(host.getId())) {
            throw new ForbiddenException("คุณไม่ใช่เจ้าของยูนิตนี้"); // 403
        }

        boolean changed = false;
        
        // อัปเดตข้อมูลที่ส่งมา (partial update)
        if (request.getCode() != null && !request.getCode().equals(unit.getCode())) {
            // ตรวจสอบ code ซ้ำในสถานที่เดียวกัน (ไม่นับตัวเอง)
            LocationUnit existingUnit = locationUnitRepository.findByLocation_IdAndCodeIgnoreCase(
                    unit.getLocation().getId(), request.getCode());
            if (existingUnit != null && !existingUnit.getId().equals(unitId)) {
                throw new UnprocessableEntityException("รหัสยูนิต '" + request.getCode() + "' มีอยู่แล้วในสถานที่นี้");
            }
            unit.setCode(request.getCode());
            changed = true;
        }
        
        if (request.getName() != null) {
            unit.setName(request.getName());
            changed = true;
        }
        
        if (request.getImageUrl() != null) {
            unit.setImageUrl(request.getImageUrl());
            changed = true;
        }
        
        if (request.getShortDesc() != null) {
            unit.setShortDesc(request.getShortDesc());
            changed = true;
        }
        
        if (request.getCapacity() != null) {
            unit.setCapacity(request.getCapacity());
            changed = true;
        }
        
        if (request.getPriceHourly() != null) {
            unit.setPriceHourly(request.getPriceHourly());
            changed = true;
        }
        
        if (request.getIsActive() != null) {
            unit.setActive(request.getIsActive());
            changed = true;
        }

        if (!changed) {
            throw new UnprocessableEntityException("ไม่พบข้อมูลที่ต้องการอัปเดต");
        }

        LocationUnit savedUnit = locationUnitRepository.save(unit);

        return new UpdateHostUnitResponse(
                savedUnit.getId(),
                savedUnit.getCode(),
                savedUnit.getName(),
                savedUnit.getImageUrl(),
                savedUnit.getShortDesc(),
                savedUnit.getCapacity(),
                savedUnit.getPriceHourly(),
                savedUnit.isActive(),
                "INHERIT" // ยูนิตยังคงแสดงตาม location status
        );
    }
    // โค้ดตัวนี้มีไว้สําหรับการ อัปเดตข้อมูลของหน่วยที่พัก (Host Unit) ที่มีอยู่แล้ว โดยตรวจสอบสิทธิ์ของผู้ใช้และความถูกต้องของข้อมูลก่อนที่จะทำการอัปเดตและตอบกลับด้วยข้อมูลที่อัปเดตของยูนิตนั้น
    //1. ยืนยันตัวตนของผู้ใช้และตรวจสอบว่าเป็นเจ้าของยูนิต
    //2. ค้นหา LocationUnit ที่จะอัปเดตโดยใช้ unitId
    //3. อัปเดตข้อมูลของยูนิตตามข้อมูลที่ส่งมาในคำขอ (partial update)
    //4. ตรวจสอบว่ารหัสยูนิต (code) ไม่ซ้ำกับยูนิตอื่นในสถานที่เดียวกัน (ไม่นับตัวเอง)
    //5. บันทึกการเปลี่ยนแปลงลงในฐานข้อมูล
    //6. ส่งกลับ UpdateHostUnitResponse ที่มีข้อมูลที่อัปเดตของยูนิต

    /**
     * (9) กำหนดชั่วโมงเปิดบริการของ Location
     */
    @Transactional
    public SetLocationHoursResponse setLocationHours(String authorizationHeader, UUID locationId, SetLocationHoursRequest request) {
        User user = getAuthenticatedUser(authorizationHeader);
        
        // ตรวจสอบสิทธิ์ - ต้องเป็น HOST เจ้าของหรือ ADMIN
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new NotFoundException("ไม่พบสถานที่")); // 404

        Set<String> roles = user.getRoles().stream()
                .map(Role::getCode)
                .collect(Collectors.toSet());
                
        boolean isAdmin = roles.contains("ADMIN");
        boolean isOwner = roles.contains("HOST") && location.getOwner().getId().equals(user.getId());
        
        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("คุณไม่มีสิทธิ์แก้ไขชั่วโมงเปิดบริการของสถานที่นี้"); // 403
        }

        // ลบชั่วโมงเปิดบริการเดิมทั้งหมด
        locationHoursRepository.deleteByLocationId(locationId);

        // เพิ่มชั่วโมงเปิดบริการใหม่
        List<LocationHours> newHours = new ArrayList<>();
        Map<String, List<TimeSlot>> allDays = request.getAllDays();
        
        for (Map.Entry<String, List<TimeSlot>> entry : allDays.entrySet()) {
            String dayName = entry.getKey();
            List<TimeSlot> timeSlots = entry.getValue();
            
            if (timeSlots != null && !timeSlots.isEmpty()) {
                LocationHours.DayOfWeek dayOfWeek = LocationHours.DayOfWeek.fromShortName(dayName);
                
                for (TimeSlot slot : timeSlots) {
                    // Validate time format และ logic
                    LocalTime startTime = parseTime(slot.getStart());
                    LocalTime endTime = parseTime(slot.getEnd());
                    
                    if (startTime.isAfter(endTime) || startTime.equals(endTime)) {
                        throw new UnprocessableEntityException(
                            String.format("เวลาเปิด (%s) ต้องน้อยกว่าเวลาปิด (%s) ในวัน %s", 
                                slot.getStart(), slot.getEnd(), dayName));
                    }
                    
                    LocationHours hours = new LocationHours();
                    hours.setLocation(location);
                    hours.setDayOfWeek(dayOfWeek);
                    hours.setStartTime(startTime);
                    hours.setEndTime(endTime);
                    newHours.add(hours);
                }
            }
        }

        locationHoursRepository.saveAll(newHours);

        // สร้าง response
        Map<String, List<TimeSlot>> responseHours = new HashMap<>();
        for (Map.Entry<String, List<TimeSlot>> entry : allDays.entrySet()) {
            responseHours.put(entry.getKey(), entry.getValue() != null ? entry.getValue() : List.of());
        }

        return new SetLocationHoursResponse("กำหนดชั่วโมงเปิดบริการสำเร็จ", responseHours);
    }

    /**
     * Helper สำหรับยืนยันตัวตนผู้ใช้ทั่วไป (ไม่เฉพาะ HOST)
     */
    private User getAuthenticatedUser(String authorizationHeader) {
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
        return userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("ไม่พบผู้ใช้"));
    }

    /**
     * Helper สำหรับ parse เวลาจาก String
     */
    private LocalTime parseTime(String timeStr) {
        try {
            return LocalTime.parse(timeStr, DateTimeFormatter.ofPattern("HH:mm"));
        } catch (DateTimeParseException e) {
            throw new UnprocessableEntityException("รูปแบบเวลาไม่ถูกต้อง: " + timeStr + " (ต้องเป็น HH:MM)");
        }
    }
    // โค้ดตัวนี้มีไว้สําหรับการ กำหนดชั่วโมงเปิดบริการของสถานที่ (Location) โดยตรวจสอบสิทธิ์ของผู้ใช้และความถูกต้องของข้อมูลก่อนที่จะบันทึกชั่วโมงใหม่และตอบกลับด้วยข้อความยืนยันและชั่วโมงที่ตั้งค่าใหม่
    // 1. ยืนยันตัวตนของผู้ใช้และตรวจสอบว่าเป็นเจ้าของสถานที่หรือ ADMIN
    // 2. ลบชั่วโมงเปิดบริการเดิมทั้งหมดของสถานที่นั้น
    // 3. เพิ่มชั่วโมงเปิดบริการใหม่ตามข้อมูลที่ส่งมาในคำข
    // 4. ตรวจสอบรูปแบบเวลาและตรรกะของเวลาเปิด-ปิด
    // 5. บันทึกชั่วโมงใหม่ลงในฐานข้อมูล
    // 6. ส่งกลับ SetLocationHoursResponse ที่มีข้อความยืนยันและชั่วโมงที่ตั้งค่าใหม่

    /**
     * (10) บล็อกช่วงเวลาของ Location
     */
    @Transactional
    public CreateLocationBlockResponse createLocationBlock(String authorizationHeader, UUID locationId, CreateLocationBlockRequest request) {
        User user = getAuthenticatedUser(authorizationHeader);
        
        // ตรวจสอบสิทธิ์ - ต้องเป็น HOST เจ้าของหรือ ADMIN
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new NotFoundException("ไม่พบสถานที่")); // 404

        Set<String> roles = user.getRoles().stream()
                .map(Role::getCode)
                .collect(Collectors.toSet());
                
        boolean isAdmin = roles.contains("ADMIN");
        boolean isOwner = roles.contains("HOST") && location.getOwner().getId().equals(user.getId());
        
        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("คุณไม่มีสิทธิ์บล็อกช่วงเวลาของสถานที่นี้"); // 403
        }

        // Parse และ validate เวลา
        LocalDateTime startTime = parseDateTime(request.getStart());
        LocalDateTime endTime = parseDateTime(request.getEnd());
        
        // ตรวจสอบ logic เวลา
        if (startTime.isAfter(endTime) || startTime.equals(endTime)) {
            throw new UnprocessableEntityException("เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด"); // 422
        }
        
        if (startTime.isBefore(LocalDateTime.now())) {
            throw new UnprocessableEntityException("ไม่สามารถบล็อกเวลาในอดีตได้"); // 422
        }

        // ตรวจสอบการทับซ้อนกับการบล็อกที่มีอยู่
        List<LocationBlock> overlappingBlocks = locationBlockRepository.findOverlappingBlocks(
                locationId, startTime, endTime);
                
        if (!overlappingBlocks.isEmpty()) {
            throw new UnprocessableEntityException("ช่วงเวลาที่เลือกทับซ้อนกับการบล็อกที่มีอยู่แล้ว"); // 409 conflict
        }

        // สร้าง LocationBlock ใหม่
        LocationBlock block = new LocationBlock();
        block.setLocation(location);
        block.setStartTime(startTime);
        block.setEndTime(endTime);
        block.setReason(request.getReason());

        LocationBlock savedBlock = locationBlockRepository.save(block);

        return new CreateLocationBlockResponse(savedBlock.getId());
        // โค้ดตัวนี้มีไว้สําหรับการ สร้างบล็อกในปฏิทินของสถานที่เฉพาะเจาะจง โดยตรวจสอบสิทธิ์ของผู้ใช้และความถูกต้องของข้อมูลก่อนที่จะสร้างบล็อกใหม่และตอบกลับด้วย ID ของบล็อกนั้น
        // 1. ยืนยันตัวตนของผู้ใช้และตรวจสอบว่าเป็นเจ้าของสถานที่หรือ ADMIN
        // 2. ตรวจว่ามีสถานที่นั้นจริงหรือไม่ LocationId
        // 3. แปลงและตรวจสอบรูปแบบของเวลาเริ่มต้นและสิ้นสุด
        // 4. ตรวจสอบตรรกะของเวลา (เริ่มต้นต้องน้อยกว่าสิ้นสุด และไม่ใช่เวลาในอดีต)
        // 5. ตรวจสอบว่าช่วงเวลาที่ต้องการบล็อกไม่ทับซ้อนกับบล็อกที่มีอยู่แล้ว
        // 6. สร้าง LocationBlock ใหม่ด้วยข้อมูลจากคำขอ
        // 7. บันทึกบล็อกลงในฐานข้อมูล
        // 8. ส่งกลับ CreateLocationBlockResponse ที่มี ID ของบล็อกนั้น
    }

    /**
     * Helper สำหรับ parse DateTime จาก String (รองรับ timezone)
     */
    private LocalDateTime parseDateTime(String dateTimeStr) {
        try {
            // รองรับรูปแบบ ISO 8601 เช่น "2024-12-25T14:30:00+07:00"
            OffsetDateTime offsetDateTime = OffsetDateTime.parse(dateTimeStr);
            return offsetDateTime.toLocalDateTime();
        } catch (Exception e) {
            throw new UnprocessableEntityException("รูปแบบวันเวลาไม่ถูกต้อง: " + dateTimeStr + " (ต้องเป็น ISO 8601 เช่น 2024-12-25T14:30:00+07:00)");
        }
    }

    /**
     * (11) บล็อกช่วงเวลาเฉพาะยูนิต
     * 
     */
    @Transactional
    public CreateUnitBlockResponse createUnitBlock(String authorizationHeader, UUID unitId, CreateUnitBlockRequest request) {
        User user = getAuthenticatedUser(authorizationHeader);
        
        // ค้นหายูนิตและตรวจสอบสิทธิ์
        LocationUnit unit = locationUnitRepository.findById(unitId)
                .orElseThrow(() -> new NotFoundException("ไม่พบยูนิต")); // 404

        Set<String> roles = user.getRoles().stream()
                .map(Role::getCode)
                .collect(Collectors.toSet());
                
        boolean isAdmin = roles.contains("ADMIN");
        boolean isOwner = roles.contains("HOST") && unit.getLocation().getOwner().getId().equals(user.getId());
        
        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("คุณไม่มีสิทธิ์บล็อกช่วงเวลาของยูนิตนี้"); // 403
        }

        // Parse และ validate เวลา
        LocalDateTime startTime = parseDateTime(request.getStart());
        LocalDateTime endTime = parseDateTime(request.getEnd());
        
        // ตรวจสอบ logic เวลา
        if (startTime.isAfter(endTime) || startTime.equals(endTime)) {
            throw new UnprocessableEntityException("เวลาเริ่มต้องน้อยกว่าเวลาสิ้นสุด"); // 422
        }
        
        if (startTime.isBefore(LocalDateTime.now())) {
            throw new UnprocessableEntityException("ไม่สามารถบล็อกเวลาในอดีตได้"); // 422
        }

        // ตรวจสอบการทับซ้อนกับการบล็อกที่มีอยู่
        List<UnitBlock> overlappingBlocks = unitBlockRepository.findOverlappingBlocks(
                unitId, startTime, endTime);
                
        if (!overlappingBlocks.isEmpty()) {
            throw new UnprocessableEntityException("ช่วงเวลาที่เลือกทับซ้อนกับการบล็อกที่มีอยู่แล้ว"); // 409 conflict
        }

        // สร้าง UnitBlock ใหม่
        UnitBlock block = new UnitBlock();
        block.setUnit(unit);
        block.setStartTime(startTime);
        block.setEndTime(endTime);
        block.setReason(request.getReason());

        UnitBlock savedBlock = unitBlockRepository.save(block);

        return new CreateUnitBlockResponse(savedBlock.getId());
    }
    // โค้ดตัวนี้มีไว้สําหรับการ สร้างบล็อกในปฏิทินของยูนิตที่พัก (Host Unit) เฉพาะเจาะจง โดยตรวจสอบสิทธิ์ของผู้ใช้และความถูกต้องของข้อมูลก่อนที่จะสร้างบล็อกใหม่และตอบกลับด้วย ID ของบล็อกนั้น
    // 1. ยืนยันตัวตนของผู้ใช้และตรวจสอบว่าเป็นเจ้าของยูนิตหรือ ADMIN
    // 2. ค้นหายูนิตที่ระบุโดยใช้ unitId
    // 3. แปลงและตรวจสอบรูปแบบของเวลาเริ่มต้นและสิ้นสุด
    // 4. ตรวจสอบตรรกะของเวลา (เริ่มต้นต้องน้อยกว่าสิ้นสุด และไม่ใช่เวลาในอดีต)
    // 5. ตรวจสอบว่าช่วงเวลาที่ต้องการบล็อกไม่ทับซ้อนกับบล็อกที่มีอยู่แล้ว
    // 6. สร้าง UnitBlock ใหม่ด้วยข้อมูลจากคำขอ
}