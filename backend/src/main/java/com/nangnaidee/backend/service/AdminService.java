// src/main/java/com/nangnaidee/backend/service/AdminService.java

package com.nangnaidee.backend.service;

import com.nangnaidee.backend.config.JwtTokenProvider;
import com.nangnaidee.backend.dto.AdminLocationReviewRequest;
import com.nangnaidee.backend.dto.AdminLocationReviewResponse;
import com.nangnaidee.backend.dto.AdminUserListResponse;
import com.nangnaidee.backend.dto.GetPaymentItemDto;
import com.nangnaidee.backend.dto.GetPaymentResponse;
import com.nangnaidee.backend.dto.LocationReviewQueueResponse;
import com.nangnaidee.backend.dto.PatchPaymentRequest;
import com.nangnaidee.backend.dto.PatchPaymentResponse;
import com.nangnaidee.backend.dto.PatchUserStatusRequest;
import com.nangnaidee.backend.dto.PatchUserStatusResponse;
import com.nangnaidee.backend.dto.PatchLocationStatusRequest;
import com.nangnaidee.backend.dto.PatchLocationStatusResponse;
import com.nangnaidee.backend.dto.UsageReportResponse;
import com.nangnaidee.backend.dto.FinanceSummaryResponse;
import com.nangnaidee.backend.dto.FinanceSummaryBucket;
import com.nangnaidee.backend.dto.AdminFinanceDashboardResponse;
import java.math.BigDecimal;
import com.nangnaidee.backend.exception.*;
import com.nangnaidee.backend.model.Payment;
import com.nangnaidee.backend.model.Role;
import com.nangnaidee.backend.model.User;
import com.nangnaidee.backend.repo.BookingRepository;
import com.nangnaidee.backend.repo.LocationRepository;
import com.nangnaidee.backend.repo.PaymentRepository;
import com.nangnaidee.backend.repo.ReviewRepository;
import com.nangnaidee.backend.repo.UserRepository;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final LocationRepository locationRepository;
    private final BookingRepository bookingRepository;
    private final ReviewRepository reviewRepository;

    @Transactional
    public GetPaymentResponse getPayments(String authorizationHeader, String status, int page, int size) {

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

        User admin = userRepository.findById(Objects.requireNonNull(userId))
                .orElseThrow(() -> new UnauthorizedException("ไม่พบผู้ใช้"));

        // 2) Authz: ต้องมี role ADMIN เท่านั้น
        Set<String> roleCodes = admin.getRoles().stream()
                .map(Role::getCode)
                .collect(Collectors.toSet());
        if (!roleCodes.contains("ADMIN")) {
            throw new ForbiddenException("ต้องเป็น ADMIN เท่านั้น");
        }

        // 3) Pagination + Filter
        Pageable pageable = PageRequest.of(page, size);
        Page<Payment> paymentsPage;

        if (status == null || status.isBlank()) {
            paymentsPage = paymentRepository.findAll(pageable);
        } else {
            paymentsPage = paymentRepository.findByStatus(status.toUpperCase(), pageable);
        }

        // 4) Mapping Payment -> GetPaymentItemDto
        List<GetPaymentItemDto> items = paymentsPage.stream()
                .map(p -> new GetPaymentItemDto(
                        p.getId(),
                        p.getBooking().getId(),
                        p.getMethod(),
                        p.getAmount(),
                        p.getStatus(),
                        p.getProofUrl(),
                        p.getReviewedBy() != null ? p.getReviewedBy().getId() : null,
                        p.getReviewedAt(),
                        p.getCreatedAt()))
                .toList();

        // 5) Return DTO
        return new GetPaymentResponse(
                items,
                paymentsPage.getNumber(),
                paymentsPage.getSize(),
                paymentsPage.getTotalElements());
    }

    // AdminService.java
    @Transactional
    public PatchPaymentResponse approvePayment(String authorizationHeader, UUID paymentId, PatchPaymentRequest req) {
        // --- Authn ---
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

        // --- Authz ---
        Set<String> roleCodes = admin.getRoles().stream().map(Role::getCode).collect(Collectors.toSet());
        if (!roleCodes.contains("ADMIN")) {
            throw new ForbiddenException("ต้องเป็น ADMIN เท่านั้น");
        }

        // --- Validate request status ---
        String reqStatus = (req.getStatus() == null ? "" : req.getStatus().trim().toUpperCase());
        if (!reqStatus.equals("APPROVED") && !reqStatus.equals("REJECTED")) {
            // ตามสเป็กอยากให้เป็น 422
            throw new UnprocessableEntityException("status ต้องเป็น APPROVED หรือ REJECTED");
        }

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NotFoundException("ไม่พบรายการชำระเงินนี้ในระบบ"));

        // --- Conflict: already reviewed ---
        if ("APPROVED".equals(payment.getStatus()) || "REJECTED".equals(payment.getStatus())) {
            // ตามสเป็ก: 409 already reviewed
            throw new ConflictException("รายการนี้ถูกทบทวนแล้ว");
        }

        // --- Update payment ---
        payment.setStatus(reqStatus);
        payment.setReviewedBy(admin);
        payment.setReviewedAt(java.time.LocalDateTime.now());

        // --- Update booking status ตามผลการรีวิว ---
        var booking = payment.getBooking();
        if ("APPROVED".equals(reqStatus)) {
            booking.setStatus("CONFIRMED"); // ถ้าอยากได้ PENDING_REVIEW ให้เปลี่ยนตรงนี้
            // (ออปชัน) สร้าง bookingCode ถ้ายังไม่มี
            if (booking.getBookingCode() == null || booking.getBookingCode().isBlank()) {
                booking.setBookingCode(generateBookingCode(booking.getId()));
            }
        } else { // REJECTED
            booking.setStatus("HOLD"); // หรือจะคงค่าเดิมก็ได้
        }

        // --- Save ทั้งสองฝั่ง ---
        paymentRepository.save(payment);
        bookingRepository.save(booking);

        return new PatchPaymentResponse(
                payment.getStatus(),
                booking.getStatus(),
                booking.getId(),
                booking.getBookingCode()
        );
    }

    @Transactional(readOnly = true)
    public LocationReviewQueueResponse getLocationReviews(String authorizationHeader, String q, Integer hostId, int page, int size) {
        // 1) Authentication
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

        // 2) Authorization: ต้องเป็น ADMIN
        Set<String> roleCodes = admin.getRoles().stream()
                .map(Role::getCode)
                .collect(Collectors.toSet());
        if (!roleCodes.contains("ADMIN")) {
            throw new ForbiddenException("ต้องเป็น ADMIN เท่านั้น");
        }

        // 3) Query locations ที่ PENDING_REVIEW
        Pageable pageable = PageRequest.of(page, size);
        Page<com.nangnaidee.backend.model.Location> locationsPage;

        // Filter by PENDING_REVIEW status (isActive = false + rejectReason = "__PENDING__")
        if ((q == null || q.trim().isEmpty()) && hostId == null) {
            // No filters - get all pending review locations
            locationsPage = locationRepository.findByIsActiveFalseAndRejectReason("__PENDING__", pageable);
        } else if (hostId != null && (q == null || q.trim().isEmpty())) {
            // Filter by hostId only
            locationsPage = locationRepository.findByOwnerIdAndIsActiveFalseAndRejectReason(hostId, "__PENDING__", pageable);
        } else if (q != null && !q.trim().isEmpty() && hostId == null) {
            // Filter by name search only
            locationsPage = locationRepository.findByNameContainingIgnoreCaseAndIsActiveFalseAndRejectReason(q.trim(), "__PENDING__", pageable);
        } else {
            // Both filters
            locationsPage = locationRepository.findByOwnerIdAndNameContainingIgnoreCaseAndIsActiveFalseAndRejectReason(hostId, q.trim(), "__PENDING__", pageable);
        }

        // 4) Map to DTO
        List<LocationReviewQueueResponse.LocationReviewItem> items = locationsPage.stream()
                .map(loc -> new LocationReviewQueueResponse.LocationReviewItem(
                        loc.getId(),
                        loc.getName(),
                        loc.getOwner().getId(),
                        loc.getCreatedAt() // ใช้ createdAt แทน submittedAt ตามที่ตกลงไว้
                ))
                .toList();

        return new LocationReviewQueueResponse(
                items,
                (int) locationsPage.getTotalElements(),
                locationsPage.getTotalPages(),
                locationsPage.getNumber(),
                locationsPage.getSize()
        );
    }

    @Transactional
    public AdminLocationReviewResponse reviewLocation(String authorizationHeader, UUID locationId, AdminLocationReviewRequest request) {
        // 1) Authentication
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

        // 2) Authorization: ต้องเป็น ADMIN
        Set<String> roleCodes = admin.getRoles().stream()
                .map(Role::getCode)
                .collect(Collectors.toSet());
        if (!roleCodes.contains("ADMIN")) {
            throw new ForbiddenException("ต้องเป็น ADMIN เท่านั้น");
        }

        // 3) Find location
        com.nangnaidee.backend.model.Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new NotFoundException("ไม่พบสถานที่"));

        // 4) Check current status - ต้องเป็น PENDING_REVIEW เท่านั้น
        String currentStatus = getLocationStatus(location);
        if (!"PENDING_REVIEW".equals(currentStatus)) {
            throw new ConflictException("สถานที่นี้ไม่ได้อยู่ในสถานะรอการตรวจสอบ");
        }

        String requestStatus = request.getStatus().trim().toUpperCase();

        // 5) Update location based on status
        if ("APPROVED".equals(requestStatus)) {
            location.setActive(true);
            location.setRejectReason(null);
        } else if ("REJECTED".equals(requestStatus)) {
            location.setActive(false);
            location.setRejectReason(request.getReason() != null ? request.getReason() : "ไม่ผ่านการตรวจสอบ");
        }

        locationRepository.save(location);

        return new AdminLocationReviewResponse(
                locationId,
                requestStatus,
                "REJECTED".equals(requestStatus) ? location.getRejectReason() : null
        );
    }

    // Helper method สำหรับดึง location status
    private String getLocationStatus(com.nangnaidee.backend.model.Location loc) {
        if (loc.isActive()) {
            return "APPROVED";
        }

        String reason = loc.getRejectReason();
        if (reason == null) {
            return "DRAFT";
        }
        if ("__PENDING__".equals(reason)) {
            return "PENDING_REVIEW";
        }

        return "REJECTED";
    }

    @Transactional(readOnly = true)
    public AdminUserListResponse getUsers(String authorizationHeader, String q, String role, String status, int page, int size) {
        // 1) Authentication
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

        // 2) Authorization: ต้องเป็น ADMIN
        Set<String> roleCodes = admin.getRoles().stream()
                .map(Role::getCode)
                .collect(Collectors.toSet());
        if (!roleCodes.contains("ADMIN")) {
            throw new ForbiddenException("ต้องเป็น ADMIN เท่านั้น");
        }

        // 3) Build query based on filters
        Pageable pageable = PageRequest.of(page, size);
        Page<User> usersPage;

        boolean hasSearch = q != null && !q.trim().isEmpty();
        boolean hasRole = role != null && !role.trim().isEmpty();
        boolean hasStatus = status != null && !status.trim().isEmpty();

        if (!hasSearch && !hasRole && !hasStatus) {
            // No filters
            usersPage = userRepository.findAllByOrderByCreatedAtDesc(pageable);
        } else if (hasSearch && !hasRole && !hasStatus) {
            // Search only
            String searchTerm = q.trim();
            usersPage = userRepository.findByFullNameContainingIgnoreCaseOrEmailContainingIgnoreCaseOrderByCreatedAtDesc(
                    searchTerm, searchTerm, pageable);
        } else if (!hasSearch && hasRole && !hasStatus) {
            // Role only
            usersPage = userRepository.findByRoleCode(role.trim(), pageable);
        } else if (!hasSearch && !hasRole && hasStatus) {
            // Status only
            boolean isActive = "ACTIVE".equalsIgnoreCase(status.trim());
            usersPage = userRepository.findByIsActiveOrderByCreatedAtDesc(isActive, pageable);
        } else if (hasSearch && hasRole && !hasStatus) {
            // Search + Role
            usersPage = userRepository.findByRoleCodeAndSearch(role.trim(), q.trim(), pageable);
        } else if (hasSearch && !hasRole && hasStatus) {
            // Search + Status
            boolean isActive = "ACTIVE".equalsIgnoreCase(status.trim());
            String searchTerm = q.trim();
            usersPage = userRepository.findByIsActiveAndFullNameContainingIgnoreCaseOrIsActiveAndEmailContainingIgnoreCaseOrderByCreatedAtDesc(
                    isActive, searchTerm, isActive, searchTerm, pageable);
        } else if (!hasSearch && hasRole && hasStatus) {
            // Role + Status
            boolean isActive = "ACTIVE".equalsIgnoreCase(status.trim());
            usersPage = userRepository.findByRoleCodeAndIsActive(role.trim(), isActive, pageable);
        } else {
            // All three filters
            boolean isActive = "ACTIVE".equalsIgnoreCase(status.trim());
            usersPage = userRepository.findByRoleCodeAndIsActiveAndSearch(role.trim(), isActive, q.trim(), pageable);
        }

        // 4) Map to DTO
        List<AdminUserListResponse.AdminUserItem> items = usersPage.stream()
                .map(user -> new AdminUserListResponse.AdminUserItem(
                        user.getId(),
                        user.getEmail(),
                        user.getFullName(),
                        null, // phoneNumber - not available in User model
                        user.getRoles().stream()
                                .map(Role::getCode)
                                .collect(Collectors.toSet()),
                        user.isActive(),
                        user.getCreatedAt(),
                        null // lastLoginAt - not available in User model
                ))
                .toList();

        return new AdminUserListResponse(
                items,
                (int) usersPage.getTotalElements(),
                usersPage.getTotalPages(),
                usersPage.getNumber(),
                usersPage.getSize()
        );
    }

    // helper สั้น ๆ สำหรับ code (ออปชัน)
    private String generateBookingCode(UUID bookingId) {
        // ตัวอย่างง่าย ๆ: BK-6ตัวแรกของ UUID (คุณจะใช้ Random/Sequence ก็ได้)
        return "BK-" + bookingId.toString().replace("-", "").substring(0, 6).toUpperCase();
    }

    @Transactional
    public PatchUserStatusResponse updateUserStatus(
            String authorizationHeader,
            Integer userId,
            PatchUserStatusRequest request
    ) {
        // 1) Authn: ต้องมี Bearer token
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("ต้องส่งโทเคนแบบ Bearer");
        }
        String token = authorizationHeader.substring("Bearer ".length()).trim();

        Integer adminId;
        try {
            adminId = jwtTokenProvider.getUserId(token);
        } catch (JwtException | IllegalArgumentException e) {
            throw new UnauthorizedException("โทเคนไม่ถูกต้องหรือหมดอายุ");
        }

        // 2) ตรวจสอบสิทธิ์ ADMIN
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new UnauthorizedException("ไม่พบผู้ใช้"));

        Set<String> roleCodes = admin.getRoles().stream()
                .map(Role::getCode)
                .collect(Collectors.toSet());
        if (!roleCodes.contains("ADMIN")) {
            throw new ForbiddenException("ต้องเป็น ADMIN เท่านั้น");
        }

        // 3) หาและตรวจสอบผู้ใช้ที่จะแก้ไข
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new NotFoundException("ไม่พบผู้ใช้ที่ระบุ"));

        // 4) ตรวจสอบค่า status
        String status = request.getStatus();
        if (status == null || status.isBlank()) {
            throw new BadRequestException("ต้องระบุ status");
        }

        status = status.trim().toUpperCase();
        if (!status.equals("SUSPENDED") && !status.equals("ACTIVE")) {
            throw new BadRequestException("status ต้องเป็น SUSPENDED หรือ ACTIVE เท่านั้น");
        }

        // 5) อัพเดทสถานะ
        targetUser.setActive(status.equals("ACTIVE"));
        User savedUser = userRepository.save(targetUser);

        // 6) สร้าง response message
        String message = status.equals("ACTIVE") ? 
            "ผู้ใช้ถูกปลดระงับเรียบร้อยแล้ว" : 
            "ผู้ใช้ถูกระงับเรียบร้อยแล้ว" + 
            (request.getReason() != null ? " (เหตุผล: " + request.getReason() + ")" : "");

        return new PatchUserStatusResponse(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                status,
                message
        );
    }

    @Transactional
    public PatchLocationStatusResponse updateLocationStatus(
            String authorizationHeader,
            UUID locationId,
            PatchLocationStatusRequest request
    ) {
        // 1) Authn: ต้องมี Bearer token
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("ต้องส่งโทเคนแบบ Bearer");
        }
        String token = authorizationHeader.substring("Bearer ".length()).trim();

        Integer adminId;
        try {
            adminId = jwtTokenProvider.getUserId(token);
        } catch (JwtException | IllegalArgumentException e) {
            throw new UnauthorizedException("โทเคนไม่ถูกต้องหรือหมดอายุ");
        }

        // 2) ตรวจสอบสิทธิ์ ADMIN
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new UnauthorizedException("ไม่พบผู้ใช้"));

        Set<String> roleCodes = admin.getRoles().stream()
                .map(Role::getCode)
                .collect(Collectors.toSet());
        if (!roleCodes.contains("ADMIN")) {
            throw new ForbiddenException("ต้องเป็น ADMIN เท่านั้น");
        }

        // 3) หาและตรวจสอบสถานที่ที่จะแก้ไข
        var location = locationRepository.findById(locationId)
                .orElseThrow(() -> new NotFoundException("ไม่พบสถานที่ที่ระบุ"));

        // 4) ตรวจสอบค่า isActive
        if (request.getIsActive() == null) {
            throw new BadRequestException("ต้องระบุ isActive");
        }

        // 5) อัพเดทสถานะ
        location.setActive(request.getIsActive());
        locationRepository.save(location);

        return new PatchLocationStatusResponse(locationId, request.getIsActive(), request.getReason());
    }

    @Transactional(readOnly = true)
    public List<com.nangnaidee.backend.dto.LocationListItem> getHostLocations(
            String authorizationHeader,
            Integer hostId,
            int page,
            int size
    ) {
        // 1) Authn: ตรวจสอบ Bearer token
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("ต้องส่งโทเคนแบบ Bearer");
        }
        String token = authorizationHeader.substring("Bearer ".length()).trim();

        Integer adminUserId;
        try {
            adminUserId = jwtTokenProvider.getUserId(token);
        } catch (JwtException | IllegalArgumentException e) {
            throw new UnauthorizedException("โทเคนไม่ถูกต้องหรือหมดอายุ");
        }

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new UnauthorizedException("ไม่พบผู้ใช้"));

        // 2) Authz: ตรวจสอบว่าเป็น ADMIN
        Set<String> roleCodes = admin.getRoles().stream()
                .map(Role::getCode)
                .collect(Collectors.toSet());
        if (!roleCodes.contains("ADMIN")) {
            throw new ForbiddenException("ต้องเป็น ADMIN เท่านั้น");
        }

        // 3) ตรวจสอบว่า host มีอยู่จริง
        if (!userRepository.existsById(hostId)) {
            throw new NotFoundException("ไม่พบ Host ที่ระบุ");
        }

        // 4) ค้นหา locations ของ host
        Pageable pageable = PageRequest.of(page, size);
        Page<com.nangnaidee.backend.model.Location> locationsPage = locationRepository.findByOwner_Id(hostId, pageable);

        // 5) แปลงเป็น DTO
        return locationsPage.getContent().stream()
                .map(loc -> new com.nangnaidee.backend.dto.LocationListItem(
                        loc.getId(),
                        loc.getName(),
                        loc.getAddressText(),
                        loc.getGeoLat(),
                        loc.getGeoLng(),
                        loc.getCoverImageUrl(),
                        null, // distanceKm ไม่ใช้
                        loc.isActive()
                ))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UsageReportResponse getUsageReport(
            String authorizationHeader,
            String fromDate,
            String toDate
    ) {
        // 1) Authn: ตรวจสอบ Bearer token
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("ต้องส่งโทเคนแบบ Bearer");
        }
        String token = authorizationHeader.substring("Bearer ".length()).trim();

        Integer adminUserId;
        try {
            adminUserId = jwtTokenProvider.getUserId(token);
        } catch (JwtException | IllegalArgumentException e) {
            throw new UnauthorizedException("โทเคนไม่ถูกต้องหรือหมดอายุ");
        }

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new UnauthorizedException("ไม่พบผู้ใช้"));

        // 2) Authz: ตรวจสอบว่าเป็น ADMIN
        Set<String> roleCodes = admin.getRoles().stream()
                .map(Role::getCode)
                .collect(Collectors.toSet());
        if (!roleCodes.contains("ADMIN")) {
            throw new ForbiddenException("ต้องเป็น ADMIN เท่านั้น");
        }

        // 3) Parse วันที่
        LocalDateTime fromDateTime;
        LocalDateTime toDateTime;
        
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            
            if (fromDate == null || fromDate.isBlank()) {
                // Default: 30 วันที่แล้ว
                fromDateTime = LocalDate.now().minusDays(30).atStartOfDay();
            } else {
                fromDateTime = LocalDate.parse(fromDate, formatter).atStartOfDay();
            }
            
            if (toDate == null || toDate.isBlank()) {
                // Default: วันนี้
                toDateTime = LocalDate.now().atTime(LocalTime.MAX);
            } else {
                toDateTime = LocalDate.parse(toDate, formatter).atTime(LocalTime.MAX);
            }
        } catch (DateTimeParseException e) {
            throw new BadRequestException("รูปแบบวันที่ไม่ถูกต้อง ใช้ yyyy-MM-dd");
        }

        if (fromDateTime.isAfter(toDateTime)) {
            throw new BadRequestException("วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด");
        }

        // 4) Query ข้อมูล KPI
        long activeUsers = userRepository.countActiveUsersUpTo(toDateTime);
        long newUsers = userRepository.countNewUsersBetween(fromDateTime, toDateTime);
        long bookingsCount = bookingRepository.countBookingsBetween(fromDateTime, toDateTime);
        long hostsOnboarded = userRepository.countNewHostsBetween(fromDateTime, toDateTime);
        long reviewsCount = reviewRepository.countReviewsBetween(fromDateTime, toDateTime);

        return new UsageReportResponse(
                activeUsers,
                newUsers,
                bookingsCount,
                hostsOnboarded,
                reviewsCount
        );
    }

    @Transactional(readOnly = true)
    public FinanceSummaryResponse getFinanceSummary(
            String authorizationHeader,
            String fromDate,
            String toDate,
            String groupBy
    ) {
        // Authn + Authz (reuse pattern)
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("ต้องส่งโทเคนแบบ Bearer");
        }
        String token = authorizationHeader.substring("Bearer ".length()).trim();
        Integer adminUserId;
        try {
            adminUserId = jwtTokenProvider.getUserId(token);
        } catch (JwtException | IllegalArgumentException e) {
            throw new UnauthorizedException("โทเคนไม่ถูกต้องหรือหมดอายุ");
        }
        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new UnauthorizedException("ไม่พบผู้ใช้"));
        Set<String> roleCodes = admin.getRoles().stream().map(Role::getCode).collect(Collectors.toSet());
        if (!roleCodes.contains("ADMIN")) {
            throw new ForbiddenException("ต้องเป็น ADMIN เท่านั้น");
        }

        // Parse date range
        LocalDateTime fromDateTime;
        LocalDateTime toDateTime;
        try {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            if (fromDate == null || fromDate.isBlank()) {
                fromDateTime = LocalDate.now().minusDays(30).atStartOfDay();
            } else {
                fromDateTime = LocalDate.parse(fromDate, formatter).atStartOfDay();
            }
            if (toDate == null || toDate.isBlank()) {
                toDateTime = LocalDate.now().atTime(LocalTime.MAX);
            } else {
                toDateTime = LocalDate.parse(toDate, formatter).atTime(LocalTime.MAX);
            }
        } catch (DateTimeParseException e) {
            throw new BadRequestException("รูปแบบวันที่ไม่ถูกต้อง ใช้ yyyy-MM-dd");
        }
        if (fromDateTime.isAfter(toDateTime)) {
            throw new BadRequestException("วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด");
        }

        String gb = (groupBy == null || groupBy.isBlank()) ? "DAY" : groupBy.trim().toUpperCase();
        if (!gb.equals("DAY") && !gb.equals("WEEK") && !gb.equals("MONTH")) {
            throw new BadRequestException("groupBy ต้องเป็น day, week หรือ month");
        }

        List<FinanceSummaryBucket> buckets;
        if (gb.equals("MONTH")) {
            // Monthly aggregation respecting provided range (may cross years)
            var rows = paymentRepository.findApprovedMonthlyRevenueRange(fromDateTime, toDateTime);
            java.util.Map<String, Object[]> rowMap = rows.stream().collect(Collectors.toMap(
                    r -> ((Number) r[0]).intValue() + "-" + ((Number) r[1]).intValue(),
                    r -> r
            ));
            java.time.YearMonth startYm = java.time.YearMonth.from(fromDateTime);
            java.time.YearMonth endYm = java.time.YearMonth.from(toDateTime);
            java.util.List<FinanceSummaryBucket> monthBuckets = new java.util.ArrayList<>();
            java.time.YearMonth cursor = startYm;
            while (!cursor.isAfter(endYm)) {
                String key = cursor.getYear() + "-" + cursor.getMonthValue();
                Object[] row = rowMap.get(key);
                LocalDate start = cursor.atDay(1);
                LocalDate end = cursor.atEndOfMonth();
                BigDecimal revenue = row==null?BigDecimal.ZERO:(row[2] instanceof BigDecimal ? (BigDecimal) row[2] : new BigDecimal(row[2].toString()));
                Long paymentsCount = row==null?0L: ((Number) row[3]).longValue();
                Long bookingsCount = row==null?0L: ((Number) row[4]).longValue();
                monthBuckets.add(new FinanceSummaryBucket(start, end, revenue, paymentsCount, bookingsCount));
                cursor = cursor.plusMonths(1);
            }
            buckets = monthBuckets;
        } else if (gb.equals("DAY")) {
            buckets = paymentRepository.findApprovedDailyRevenue(fromDateTime, toDateTime).stream()
                .map(row -> {
                LocalDate day = ((java.sql.Date) row[0]).toLocalDate();
                BigDecimal revenue = (row[1] instanceof BigDecimal) ? (BigDecimal) row[1] : new BigDecimal(row[1].toString());
                Long paymentsCount = ((Number) row[2]).longValue();
                Long bookingsCount = ((Number) row[3]).longValue();
                return new FinanceSummaryBucket(day, day, revenue, paymentsCount, bookingsCount);
                })
                .toList();
        } else { // WEEK
            buckets = paymentRepository.findApprovedWeeklyRevenue(fromDateTime, toDateTime).stream()
                .map(row -> {
                int year = ((Number) row[0]).intValue();
                int week = ((Number) row[1]).intValue();
                BigDecimal revenue = (row[2] instanceof BigDecimal) ? (BigDecimal) row[2] : new BigDecimal(row[2].toString());
                Long paymentsCount = ((Number) row[3]).longValue();
                Long bookingsCount = ((Number) row[4]).longValue();
                java.time.temporal.WeekFields wf = java.time.temporal.WeekFields.ISO;
                LocalDate start = LocalDate.of(year, 1, 4) // ensure week-based calculation
                    .with(wf.weekOfWeekBasedYear(), week)
                    .with(wf.dayOfWeek(), 1);
                LocalDate end = start.plusDays(6);
                return new FinanceSummaryBucket(start, end, revenue, paymentsCount, bookingsCount);
                })
                .toList();
        }

        BigDecimal totalRevenue = buckets.stream()
                .map(FinanceSummaryBucket::getRevenue)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long totalPayments = buckets.stream().mapToLong(FinanceSummaryBucket::getPaymentsCount).sum();
        long totalBookings = buckets.stream().mapToLong(FinanceSummaryBucket::getBookingsCount).sum();

        return new FinanceSummaryResponse(
                fromDateTime.toLocalDate(),
                toDateTime.toLocalDate(),
                gb,
                "THB",
                totalRevenue,
                totalPayments,
                totalBookings,
                buckets
        );
    }

    @Transactional(readOnly = true)
    public AdminFinanceDashboardResponse getFinanceDashboard(
            String authorizationHeader,
            String from,
            String to,
            String view
    ) {
        // Authn/Authz reuse
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("ต้องส่งโทเคนแบบ Bearer");
        }
        String token = authorizationHeader.substring("Bearer ".length()).trim();
        Integer adminUserId;
        try { adminUserId = jwtTokenProvider.getUserId(token); } catch (JwtException | IllegalArgumentException e) { throw new UnauthorizedException("โทเคนไม่ถูกต้องหรือหมดอายุ"); }
        User admin = userRepository.findById(adminUserId).orElseThrow(() -> new UnauthorizedException("ไม่พบผู้ใช้"));
        Set<String> roleCodes = admin.getRoles().stream().map(Role::getCode).collect(Collectors.toSet());
        if (!roleCodes.contains("ADMIN")) throw new ForbiddenException("ต้องเป็น ADMIN เท่านั้น");

        // Parse dates (optional, use for limiting totals if provided)
        LocalDateTime fromDateTime; LocalDateTime toDateTime;
        try {
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("yyyy-MM-dd");
            fromDateTime = (from==null||from.isBlank()) ? LocalDate.now().withDayOfMonth(1).atStartOfDay() : LocalDate.parse(from, fmt).atStartOfDay();
            toDateTime = (to==null||to.isBlank()) ? LocalDate.now().atTime(LocalTime.MAX) : LocalDate.parse(to, fmt).atTime(LocalTime.MAX);
        } catch (DateTimeParseException ex){ throw new BadRequestException("รูปแบบวันที่ไม่ถูกต้อง ใช้ yyyy-MM-dd"); }
        if (fromDateTime.isAfter(toDateTime)) throw new BadRequestException("วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด");

        String vw = (view==null||view.isBlank())?"month":view.trim().toLowerCase();
        if (!vw.equals("month") && !vw.equals("year")) throw new BadRequestException("view ต้องเป็น month หรือ year");

        // Cards
        long totalBookings = bookingRepository.countBookingsBetween(fromDateTime, toDateTime);
        // Revenue approved in range
        BigDecimal totalIncome = paymentRepository.findApprovedDailyRevenue(fromDateTime, toDateTime).stream()
                .map(r -> (r[1] instanceof BigDecimal)?(BigDecimal) r[1]: new BigDecimal(r[1].toString()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        long activeLocations = locationRepository.count(); // หรือ filter active เท่านั้นถ้ามีฟิลด์ isActive
        // If Location has isActive boolean, we can refine: locationRepository.countByIsActiveTrue() (add method if needed)

        AdminFinanceDashboardResponse.DashboardCards cards = new AdminFinanceDashboardResponse.DashboardCards(
                totalBookings,
                totalIncome,
                activeLocations
        );

        AdminFinanceDashboardResponse response = new AdminFinanceDashboardResponse();
        response.setCards(cards);
        response.setView(vw);

        if (vw.equals("month")) {
            int targetYear = fromDateTime.getYear();
            response.setYear(targetYear);
            // Current year buckets
            var currentRows = paymentRepository.findApprovedMonthlyTotals(targetYear);
            // Previous year for comparison
            var prevRows = paymentRepository.findApprovedMonthlyRevenueSimple(targetYear - 1);
            java.util.Map<Integer, BigDecimal> prevMap = prevRows.stream().collect(Collectors.toMap(
                    r -> ((Number) r[0]).intValue(),
                    r -> (r[1] instanceof BigDecimal)?(BigDecimal) r[1]: new BigDecimal(r[1].toString())
            ));
            java.util.Map<Integer, Object[]> curMap = currentRows.stream().collect(Collectors.toMap(
                    r -> ((Number) r[0]).intValue(),
                    r -> r
            ));
            List<AdminFinanceDashboardResponse.MonthIncomeBucket> monthBuckets = java.util.stream.IntStream.rangeClosed(1,12)
                    .mapToObj(m -> {
                        Object[] row = curMap.get(m);
                        BigDecimal income = row==null?BigDecimal.ZERO: (row[1] instanceof BigDecimal? (BigDecimal) row[1]: new BigDecimal(row[1].toString()));
                        Long payments = row==null?0L: ((Number) row[2]).longValue();
                        Long bookings = row==null?0L: ((Number) row[3]).longValue();
                        BigDecimal prevIncome = prevMap.getOrDefault(m, BigDecimal.ZERO);
                        String label = java.time.Month.of(m).name().substring(0,3).toLowerCase();
                        label = Character.toUpperCase(label.charAt(0)) + label.substring(1); // Jan, Feb
                        return new AdminFinanceDashboardResponse.MonthIncomeBucket(m, label, income, prevIncome, bookings, payments);
                    })
                    .toList();
            response.setMonths(monthBuckets);
        } else { // year view
            int endYear = LocalDate.now().getYear();
            int startYear = endYear - 4; // last 5 years
            var rows = paymentRepository.findApprovedYearlyTotals(startYear, endYear);
            List<AdminFinanceDashboardResponse.YearIncomeBucket> yearBuckets = rows.stream().map(r -> {
                int yr = ((Number) r[0]).intValue();
                BigDecimal income = (r[1] instanceof BigDecimal)?(BigDecimal) r[1]: new BigDecimal(r[1].toString());
                Long payments = ((Number) r[2]).longValue();
                Long bookings = ((Number) r[3]).longValue();
                return new AdminFinanceDashboardResponse.YearIncomeBucket(yr, income, bookings, payments);
            }).toList();
            response.setYears(yearBuckets);
        }

        return response;
    }
}
