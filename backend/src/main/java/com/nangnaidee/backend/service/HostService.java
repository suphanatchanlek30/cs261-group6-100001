// backend/src/main/java/com/nangnaidee/backend/service/HostService.java


package com.nangnaidee.backend.service;

import com.nangnaidee.backend.config.JwtTokenProvider;
import com.nangnaidee.backend.dto.*;
import com.nangnaidee.backend.exception.BadRequestException;
import com.nangnaidee.backend.exception.ForbiddenException;
import com.nangnaidee.backend.exception.NotFoundException;
import com.nangnaidee.backend.exception.UnauthorizedException;
import com.nangnaidee.backend.exception.UnprocessableEntityException;
import com.nangnaidee.backend.model.*;
import com.nangnaidee.backend.repo.BookingOverviewRepository;
import com.nangnaidee.backend.repo.BookingRepository;
import com.nangnaidee.backend.repo.HostRevenueSummaryRepository;
import com.nangnaidee.backend.repo.LocationRepository;
import com.nangnaidee.backend.repo.LocationUnitRepository;
import com.nangnaidee.backend.repo.LocationHoursRepository;
import com.nangnaidee.backend.repo.LocationBlockRepository;
import com.nangnaidee.backend.repo.UnitBlockRepository;
import com.nangnaidee.backend.repo.RevenueTransactionRepository;
import com.nangnaidee.backend.repo.UserRepository;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class HostService {

private final BookingOverviewRepository bookingOverviewRepository;
private final BookingRepository bookingRepository;
private final HostRevenueSummaryRepository hostRevenueSummaryRepository;
private final RevenueTransactionRepository revenueTransactionRepository;
private final LocationRepository locationRepository;
private final LocationUnitRepository locationUnitRepository;
private final LocationHoursRepository locationHoursRepository;
private final LocationBlockRepository locationBlockRepository;
private final UnitBlockRepository unitBlockRepository;
private final UserRepository userRepository;
private final JwtTokenProvider jwtTokenProvider;


    // ⭐️ ใช้ค่าคงที่พิเศษเพื่อระบุสถานะ "รอตรวจสอบ"
    private static final String PENDING_REVIEW_MARKER = "__PENDING__";
    // ⭐️ ใช้ค่าคงที่พิเศษเพื่อระบุว่าเคย APPROVED แล้ว แต่เจ้าของปิด Active ชั่วคราว
    private static final String APPROVED_INACTIVE_MARKER = "__APPROVED__";

    /**
     * Helper กลางสำหรับแปลง Entity เป็น Status String
     */
    private String getPublishStatus(Location loc) {
        // ลำดับความสำคัญของสถานะจาก reason ก่อน
        String reason = loc.getRejectReason();
        if (PENDING_REVIEW_MARKER.equals(reason)) {
            return "PENDING_REVIEW";
        }
        if (APPROVED_INACTIVE_MARKER.equals(reason)) {
            // เคย APPROVED แล้ว แต่ถูกปิด Active ชั่วคราว
            return "APPROVED";
        }
        if (reason != null) {
            // มีข้อความอื่น => REJECTED
            return "REJECTED";
        }

        // ไม่มี reason
        if (loc.isActive()) {
            return "APPROVED"; // อนุมัติและเปิดใช้งาน
        }

        return "DRAFT"; // ยังเป็นร่าง (ยังไม่เคยอนุมัติ)
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
                getPublishStatus(loc), // 👈 ใช้ Helper ใหม่
                loc.isActive()
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

        // ⭐️ ตรวจสอบ Logic: เมื่อ APPROVED อนุญาตแก้เฉพาะ isActive เท่านั้น
        if ("APPROVED".equals(currentStatus)) {
            // ต้องส่งมาเฉพาะ isActive และห้ามแก้ฟิลด์อื่น
            boolean hasOtherFields =
                    request.getName() != null ||
                    request.getDescription() != null ||
                    request.getAddress() != null ||
                    request.getGeoLat() != null ||
                    request.getGeoLng() != null ||
                    request.getCoverImageUrl() != null;

            if (hasOtherFields) {
                throw new UnprocessableEntityException("เมื่อสถานะ APPROVED สามารถแก้ได้เฉพาะ isActive เท่านั้น");
            }
            if (request.getIsActive() == null) {
                throw new UnprocessableEntityException("กรุณาระบุ isActive เป็น true/false");
            }

            boolean target = request.getIsActive();
            loc.setActive(target);
            // เก็บ marker เพื่อให้สถานะยังคงเป็น APPROVED แม้ inactive
            if (target) {
                // เปิดใช้งาน -> ล้าง marker
                if (APPROVED_INACTIVE_MARKER.equals(loc.getRejectReason())) {
                    loc.setRejectReason(null);
                }
            } else {
                // ปิดใช้งาน -> set marker
                loc.setRejectReason(APPROVED_INACTIVE_MARKER);
            }
            locationRepository.save(loc);
            return getMyLocationDetail(authorizationHeader, locationId);
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
            // ใน DRAFT/REJECTED ไม่ให้แก้ isActive โดยตรง ให้ใช้ flow submit/approve
            throw new UnprocessableEntityException("แก้ isActive ได้เฉพาะตอนสถานะ APPROVED เท่านั้น");
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
	
	    public Page<RevenueTransactionDto> getRevenueTransactions(
            String authorizationHeader,
            LocalDateTime from,
            LocalDateTime to,
            String method,
            UUID locationId,
            int page,
            int size) {

        // 1) Authn: ต้องมี Bearer token
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

        // 2) Authz: ต้องมี role HOST เท่านั้น
        Set<String> roleCodes = user.getRoles().stream()
                .map(Role::getCode)
                .collect(Collectors.toSet());
        if (!roleCodes.contains("HOST")) {
            throw new ForbiddenException("ต้องเป็น HOST เท่านั้น");
        }

        // 3) ตรวจสอบ locationId ถ้ามีการระบุมา
        if (locationId != null) {
            var location = locationRepository.findById(locationId)
                .orElseThrow(() -> new NotFoundException("ไม่พบสถานที่ที่ระบุ"));
            
            // ตรวจสอบว่าเป็นเจ้าของสถานที่จริง
            if (!location.getOwner().getId().equals(userId)) {
                throw new ForbiddenException("คุณไม่ใช่เจ้าของสถานที่นี้");
            }
        }

        // 4) Query รายการ transactions (เฉพาะ APPROVED เท่านั้น)
        Page<Object[]> results = revenueTransactionRepository.findRevenueTransactions(
            userId,
            locationId,
            method,
            from,
            to,
            PageRequest.of(page, size)
        );

        // 4) Convert to DTO
        return results.map(row -> {
            LocalDateTime approvedAt = null;
            if (row[4] != null) {
                if (row[4] instanceof java.sql.Timestamp ts) {
                    approvedAt = ts.toLocalDateTime();
                } else if (row[4] instanceof LocalDateTime ldt) {
                    approvedAt = ldt;
                } else {
                    approvedAt = LocalDateTime.parse(row[4].toString());
                }
            }

            return new RevenueTransactionDto(
                toUuid(row[0]),          // bookingId
                toUuid(row[1]),          // paymentId
                (BigDecimal) row[2],     // amount
                (String) row[3],         // method
                approvedAt,              // approvedAt
                (String) row[5]          // locationName
            );
        });
    }

    public GetBookingHostResponse getBooking(String authorizationHeader, String bookingId) {

        // 1) Authn: ต้องมี Bearer token
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

        User admin = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("ไม่พบผู้ใช้"));

        // 2) Authz: ต้องมี role ADMIN เท่านั้น
        Set<String> roleCodes = admin.getRoles().stream()
                .map(Role::getCode)
                .collect(Collectors.toSet());
        if (roleCodes.contains("USER")) {
            throw new ForbiddenException("ต้องเป็น HOST หรือ Admin เท่านั้น");
        }

        // หา Booking
        UUID id = UUID.fromString(bookingId);
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("ไม่พบ Booking ที่มี id นี้"));

        // หา LocationUnit
        UUID locationUnitId = booking.getLocationUnitId();
        if (locationUnitId == null) {
            throw new NotFoundException("Booking นี้ไม่มี LocationUnitId");
        }

        LocationUnit locationUnit = locationUnitRepository.findById(locationUnitId)
                .orElseThrow(() -> new NotFoundException("ไม่พบ LocationUnit ที่มี id นี้"));

        // หา Location
        UUID locationId = locationUnit.getLocationId(); // แปลงเป็น local var
        if (locationId == null) {
            throw new NotFoundException("Location Unit นี้ไม่มี LocationId");
        }

        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new NotFoundException("ไม่พบ Location ที่มี id นี้"));

        Integer ownerId = location.getOwner().getId();

        if (!userId.equals(ownerId)) {
            throw new ForbiddenException("คุณไม่ใช่เจ้าของสถานที่ของ booking id นี้");
        }

        return GetBookingHostResponse.builder()
                .id(booking.getId())
                .bookingCode(booking.getBookingCode())
                .startTime(booking.getStartTime())
                .endTime(booking.getEndTime())
                .hours(booking.getHours())
                .total(booking.getTotal())
                .status(booking.getStatus())
                .locationUnitId(locationUnit.getId())
                .locationUnitName(locationUnit.getName())
                .locationUnitCode(locationUnit.getCode())
                .ownerId(location.getOwner().getId())
                .build();

    }

    // helper: flexible UUID conversion for native query results
    private java.util.UUID toUuid(Object o) {
        if (o == null) return null;
        if (o instanceof java.util.UUID) return (java.util.UUID) o;
        if (o instanceof String s) {
            if (s.isBlank()) return null;
            return java.util.UUID.fromString(s);
        }
        if (o instanceof byte[] bytes) {
            return java.util.UUID.nameUUIDFromBytes(bytes);
        }
        // handle nested Object[] (some JPA drivers wrap rows)
        if (o instanceof Object[] arr && arr.length > 0) return toUuid(arr[0]);
        // fallback
        return java.util.UUID.fromString(o.toString());
    }


    public Page<GetAllBookingHostResponse> getallBooking(
            String authorizationHeader,
            String status,
            UUID locationId,
            UUID unitId,
            LocalDateTime from,
            LocalDateTime to,
            int page,
            int size,
            String sort) {

        // 1) Authn: ต้องมี Bearer token
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

        User admin = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("ไม่พบผู้ใช้"));

        // 2) Authz: ต้องมี role ADMIN เท่านั้น
        Set<String> roleCodes = admin.getRoles().stream()
                .map(Role::getCode)
                .collect(Collectors.toSet());
        if (!roleCodes.contains("HOST")) {
            throw new ForbiddenException("ต้องเป็น HOST เท่านั้น");
        }


        // 3) สร้าง Pageable
        Pageable pageable = PageRequest.of(page, size);

        // 4) เรียก Repository แบบกรองโดย owner (host)
        Page<Object[]> results = bookingOverviewRepository.findHostOverview(
                userId,
                (status == null || status.isBlank()) ? null : status,
                locationId,
                unitId,
                from,
                to,
                pageable
        );

        // 5) Map Object[] → DTO (index ตาม SELECT ใน BookingOverviewRepository)
        Page<GetAllBookingHostResponse> dtoPage = results.map(row -> {
            GetAllBookingHostResponse dto = new GetAllBookingHostResponse();

            // booking
            dto.setBookingId(toUuid(row[0]));
            dto.setStatus((String) row[1]);
            dto.setBookingCode((String) row[2]);
            // startTime / endTime may come as java.sql.Timestamp from JDBC — convert safely
            if (row[3] instanceof java.sql.Timestamp ts3) {
                dto.setStartTime(ts3.toLocalDateTime());
            } else if (row[3] instanceof LocalDateTime ldt3) {
                dto.setStartTime(ldt3);
            } else {
                dto.setStartTime(row[3] == null ? null : LocalDateTime.parse(row[3].toString()));
            }

            if (row[4] instanceof java.sql.Timestamp ts4) {
                dto.setEndTime(ts4.toLocalDateTime());
            } else if (row[4] instanceof LocalDateTime ldt4) {
                dto.setEndTime(ldt4);
            } else {
                dto.setEndTime(row[4] == null ? null : LocalDateTime.parse(row[4].toString()));
            }
            dto.setHours(row[5] == null ? 0 : ((Number) row[5]).intValue());
            dto.setTotal(row[6] == null ? null : (BigDecimal) row[6]);

            // unit
            dto.setUnitId(toUuid(row[7]));
            dto.setUnitCode((String) row[8]);
            dto.setUnitName((String) row[9]);

            // location
            dto.setLocationId(toUuid(row[13]));
            dto.setLocationName((String) row[14]);

            // payment
            dto.setPaymentId(toUuid(row[19]));
            dto.setPaymentStatus((String) row[20]);

            // review / rating
            dto.setReviewId(toUuid(row[24]));
            dto.setAvgRating(row[22] == null ? null : ((Number) row[22]).doubleValue());
            dto.setCntRating(row[23] == null ? null : ((Number) row[23]).intValue());

            return dto;
        });

        return dtoPage;
    }
	
	//ของฟิลม์
	//ขั้นตอนในการ merge เรานําโค้ดของทั้ง คู่ มา combine กันเป็นวิธีแรกที่เราจะใช้ เราเชื่อว่ามันน่าจะทํางานรวมกัน ถ้าไม่แย่แน่ๆ

        public List<HostRevenueSummaryResponse> getRevenueSummary(
            String authorizationHeader,
            LocalDateTime from,
            LocalDateTime to,
            String groupBy) {

        // 1) Authn: ต้องมี Bearer token
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

        // 2) Authz: ต้องมี role HOST เท่านั้น
        Set<String> roleCodes = user.getRoles().stream()
                .map(Role::getCode)
                .collect(Collectors.toSet());
        if (!roleCodes.contains("HOST")) {
            throw new ForbiddenException("ต้องเป็น HOST เท่านั้น");
        }

        // 3) ตรวจสอบ parameters
        if (from == null || to == null) {
            throw new BadRequestException("ต้องระบุช่วงเวลา from และ to");
        }
        if (from.isAfter(to)) {
            throw new BadRequestException("from ต้องมาก่อน to");
        }

        // 4) ตรวจสอบ groupBy และ Query ข้อมูลตาม group
        if (groupBy == null || groupBy.isBlank()) groupBy = "day";

        if ("day".equalsIgnoreCase(groupBy)) {
            List<Object[]> results = hostRevenueSummaryRepository.findRevenueSummaryByDay(
                userId, from, to
            );
            return results.stream()
                .map(row -> HostRevenueSummaryResponse.builder()
                    .date(((java.sql.Date) row[0]).toLocalDate().atStartOfDay())
                    .totalRevenue((BigDecimal) row[1])
                    .totalBookings(((Number) row[2]).intValue())
                    .build())
                .collect(Collectors.toList());
        } else if ("month".equalsIgnoreCase(groupBy)) {
            List<Object[]> results = hostRevenueSummaryRepository.findRevenueSummaryByMonth(
                userId, from, to
            );
            return results.stream()
                .map(row -> {
                    int yr = ((Number) row[0]).intValue();
                    int mon = ((Number) row[1]).intValue();
                    java.time.LocalDateTime dt = java.time.LocalDate.of(yr, mon, 1).atStartOfDay();
                    return HostRevenueSummaryResponse.builder()
                        .date(dt)
                        .totalRevenue((BigDecimal) row[2])
                        .totalBookings(((Number) row[3]).intValue())
                        .build();
                })
                .collect(Collectors.toList());
        } else if ("year".equalsIgnoreCase(groupBy)) {
            List<Object[]> results = hostRevenueSummaryRepository.findRevenueSummaryByYear(
                userId, from, to
            );
            return results.stream()
                .map(row -> {
                    int yr = ((Number) row[0]).intValue();
                    java.time.LocalDateTime dt = java.time.LocalDate.of(yr, 1, 1).atStartOfDay();
                    return HostRevenueSummaryResponse.builder()
                        .date(dt)
                        .totalRevenue((BigDecimal) row[1])
                        .totalBookings(((Number) row[2]).intValue())
                        .build();
                })
                .collect(Collectors.toList());
        } else {
            throw new BadRequestException("groupBy ต้องเป็น 'day', 'month' หรือ 'year'");
        }
    }

    /**
     * Host dashboard: cards + bookingTrend + revenueDaily
     * from/to optional (LocalDateTime); if null -> last 7 days
     */
        public com.nangnaidee.backend.dto.HostDashboardResponse getDashboard(
            String authorizationHeader,
            LocalDateTime from,
            LocalDateTime to,
            String groupBy) {

        User host = getAuthenticatedHost(authorizationHeader);
        Integer ownerId = host.getId();

        // Locations counts
        List<Location> allLocations = locationRepository.findByOwnerIdOrderByCreatedAtDesc(ownerId);
        int locationsTotal = allLocations.size();

        // pending review count (isActive = false and rejectReason = PENDING_REVIEW_MARKER)
        long pending = 0;
        try {
            var page = locationRepository.findByOwnerIdAndIsActiveFalseAndRejectReason(ownerId, PENDING_REVIEW_MARKER, org.springframework.data.domain.PageRequest.of(0, 1));
            pending = page.getTotalElements();
        } catch (Exception ignored) {
            // fallback scan
            pending = allLocations.stream().filter(l -> !l.isActive() && PENDING_REVIEW_MARKER.equals(l.getRejectReason())).count();
        }

        // approved count
        List<Location> approvedList = locationRepository.findByOwnerIdAndIsActiveOrderByCreatedAtDesc(ownerId, true);
        int approved = approvedList.size();

        // groupBy default
        if (groupBy == null || groupBy.isBlank()) groupBy = "day";

        // Prepare period range depending on groupBy
        java.time.LocalDate endDate;
        java.time.LocalDate startDate;

        if ("day".equalsIgnoreCase(groupBy)) {
            endDate = (to == null) ? java.time.LocalDate.now() : to.toLocalDate();
            startDate = (from == null) ? endDate.minusDays(6) : from.toLocalDate();
        } else if ("month".equalsIgnoreCase(groupBy)) {
            endDate = (to == null) ? java.time.LocalDate.now() : to.toLocalDate();
            // default to last 12 months
            startDate = (from == null) ? endDate.minusMonths(11) : from.toLocalDate();
            // normalize to first day of month when iterating
        } else if ("year".equalsIgnoreCase(groupBy)) {
            endDate = (to == null) ? java.time.LocalDate.now() : to.toLocalDate();
            // default to last 5 years
            startDate = (from == null) ? endDate.minusYears(4) : from.toLocalDate();
        } else {
            throw new BadRequestException("groupBy ต้องเป็น 'day', 'month' หรือ 'year'");
        }

        java.time.LocalDateTime fromDt;
        java.time.LocalDateTime toDt;
        if ("month".equalsIgnoreCase(groupBy)) {
            fromDt = startDate.withDayOfMonth(1).atStartOfDay();
            toDt = endDate.plusMonths(1).withDayOfMonth(1).atStartOfDay();
        } else if ("year".equalsIgnoreCase(groupBy)) {
            fromDt = startDate.withDayOfYear(1).atStartOfDay();
            toDt = endDate.plusYears(1).withDayOfYear(1).atStartOfDay();
        } else {
            fromDt = startDate.atStartOfDay();
            toDt = endDate.plusDays(1).atStartOfDay();
        }

        // Query repository according to groupBy
        java.util.Map<java.time.LocalDate, java.util.Map<String, Object>> map = new java.util.HashMap<>();

        if ("day".equalsIgnoreCase(groupBy)) {
            List<Object[]> rows = hostRevenueSummaryRepository.findRevenueSummaryByDay(ownerId, fromDt, toDt);
            if (rows != null) {
                for (Object[] r : rows) {
                    if (r == null || r.length < 3) continue;
                    java.sql.Date d = (java.sql.Date) r[0];
                    java.time.LocalDate ld = d.toLocalDate();
                    java.math.BigDecimal rev = (r[1] == null) ? java.math.BigDecimal.ZERO : (java.math.BigDecimal) r[1];
                    int cnt = (r[2] == null) ? 0 : ((Number) r[2]).intValue();
                    var m = new java.util.HashMap<String, Object>();
                    m.put("rev", rev);
                    m.put("cnt", cnt);
                    map.put(ld, m);
                }
            }
        } else if ("month".equalsIgnoreCase(groupBy)) {
            List<Object[]> rows = hostRevenueSummaryRepository.findRevenueSummaryByMonth(ownerId, fromDt, toDt);
            if (rows != null) {
                for (Object[] r : rows) {
                    if (r == null || r.length < 4) continue;
                    int yr = ((Number) r[0]).intValue();
                    int mon = ((Number) r[1]).intValue();
                    java.time.LocalDate ld = java.time.LocalDate.of(yr, mon, 1);
                    java.math.BigDecimal rev = (r[2] == null) ? java.math.BigDecimal.ZERO : (java.math.BigDecimal) r[2];
                    int cnt = (r[3] == null) ? 0 : ((Number) r[3]).intValue();
                    var m = new java.util.HashMap<String, Object>();
                    m.put("rev", rev);
                    m.put("cnt", cnt);
                    map.put(ld, m);
                }
            }
        } else { // year
            List<Object[]> rows = hostRevenueSummaryRepository.findRevenueSummaryByYear(ownerId, fromDt, toDt);
            if (rows != null) {
                for (Object[] r : rows) {
                    if (r == null || r.length < 3) continue;
                    int yr = ((Number) r[0]).intValue();
                    java.time.LocalDate ld = java.time.LocalDate.of(yr, 1, 1);
                    java.math.BigDecimal rev = (r[1] == null) ? java.math.BigDecimal.ZERO : (java.math.BigDecimal) r[1];
                    int cnt = (r[2] == null) ? 0 : ((Number) r[2]).intValue();
                    var m = new java.util.HashMap<String, Object>();
                    m.put("rev", rev);
                    m.put("cnt", cnt);
                    map.put(ld, m);
                }
            }
        }

        List<com.nangnaidee.backend.dto.HostDashboardResponse.BookingTrendItem> bookingTrend = new java.util.ArrayList<>();
        List<com.nangnaidee.backend.dto.HostDashboardResponse.RevenueDailyItem> revenueDaily = new java.util.ArrayList<>();

        // Iterate periods: day / month / year
        if ("day".equalsIgnoreCase(groupBy)) {
            java.time.LocalDate cursor = startDate;
            while (!cursor.isAfter(endDate)) {
                var entry = map.get(cursor);
                int cnt = 0;
                java.math.BigDecimal rev = java.math.BigDecimal.ZERO;
                if (entry != null) {
                    cnt = (Integer) entry.get("cnt");
                    rev = (java.math.BigDecimal) entry.get("rev");
                }
                bookingTrend.add(new com.nangnaidee.backend.dto.HostDashboardResponse.BookingTrendItem(cursor, cnt));
                revenueDaily.add(new com.nangnaidee.backend.dto.HostDashboardResponse.RevenueDailyItem(cursor, rev));
                cursor = cursor.plusDays(1);
            }
        } else if ("month".equalsIgnoreCase(groupBy)) {
            java.time.LocalDate cursor = startDate.withDayOfMonth(1);
            java.time.LocalDate last = endDate.withDayOfMonth(1);
            while (!cursor.isAfter(last)) {
                var entry = map.get(cursor);
                int cnt = 0;
                java.math.BigDecimal rev = java.math.BigDecimal.ZERO;
                if (entry != null) {
                    cnt = (Integer) entry.get("cnt");
                    rev = (java.math.BigDecimal) entry.get("rev");
                }
                bookingTrend.add(new com.nangnaidee.backend.dto.HostDashboardResponse.BookingTrendItem(cursor, cnt));
                revenueDaily.add(new com.nangnaidee.backend.dto.HostDashboardResponse.RevenueDailyItem(cursor, rev));
                cursor = cursor.plusMonths(1);
            }
        } else { // year
            java.time.LocalDate cursor = startDate.withDayOfYear(1);
            java.time.LocalDate last = endDate.withDayOfYear(1);
            while (!cursor.isAfter(last)) {
                var entry = map.get(cursor);
                int cnt = 0;
                java.math.BigDecimal rev = java.math.BigDecimal.ZERO;
                if (entry != null) {
                    cnt = (Integer) entry.get("cnt");
                    rev = (java.math.BigDecimal) entry.get("rev");
                }
                bookingTrend.add(new com.nangnaidee.backend.dto.HostDashboardResponse.BookingTrendItem(cursor, cnt));
                revenueDaily.add(new com.nangnaidee.backend.dto.HostDashboardResponse.RevenueDailyItem(cursor, rev));
                cursor = cursor.plusYears(1);
            }
        }

        // Compute card income: if day -> today's income as before; otherwise sum over period
        java.math.BigDecimal periodIncome = java.math.BigDecimal.ZERO;
        if ("day".equalsIgnoreCase(groupBy)) {
            java.time.LocalDate today = java.time.LocalDate.now();
            java.time.LocalDateTime todayStart = today.atStartOfDay();
            java.time.LocalDateTime todayEnd = today.plusDays(1).atStartOfDay();
            try {
                var paymentsPage = revenueTransactionRepository.findRevenueTransactions(ownerId, null, null, todayStart, todayEnd, org.springframework.data.domain.PageRequest.of(0, 1000));
                for (Object[] row : paymentsPage.getContent()) {
                    if (row == null || row.length < 3) continue;
                    Object amt = row[2];
                    if (amt instanceof java.math.BigDecimal bd) periodIncome = periodIncome.add(bd);
                    else if (amt instanceof Number n) periodIncome = periodIncome.add(new java.math.BigDecimal(n.toString()));
                }
            } catch (Exception ex) {
                // ignore and keep zero if repo fails
            }
        } else {
            // sum values from map
            for (var e : map.values()) {
                if (e == null) continue;
                java.math.BigDecimal rev = (java.math.BigDecimal) e.get("rev");
                if (rev != null) periodIncome = periodIncome.add(rev);
            }
        }

        com.nangnaidee.backend.dto.HostDashboardResponse.Cards cards = new com.nangnaidee.backend.dto.HostDashboardResponse.Cards(
                locationsTotal,
                (int) pending,
                approved,
                periodIncome
        );

        return new com.nangnaidee.backend.dto.HostDashboardResponse(cards, bookingTrend, revenueDaily);
    }
}