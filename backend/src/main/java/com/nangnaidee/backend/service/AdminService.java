// src/main/java/com/nangnaidee/backend/service/AdminService.java

package com.nangnaidee.backend.service;

import com.nangnaidee.backend.config.JwtTokenProvider;
import com.nangnaidee.backend.dto.GetPaymentItemDto;
import com.nangnaidee.backend.dto.GetPaymentResponse;
import com.nangnaidee.backend.dto.PatchPaymentRequest;
import com.nangnaidee.backend.dto.PatchPaymentResponse;
import com.nangnaidee.backend.exception.*;
import com.nangnaidee.backend.model.Payment;
import com.nangnaidee.backend.model.Role;
import com.nangnaidee.backend.model.User;
import com.nangnaidee.backend.repo.PaymentRepository;
import com.nangnaidee.backend.repo.LocationRepository;
import com.nangnaidee.backend.repo.UserRepository;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import com.nangnaidee.backend.repo.BookingRepository;


import java.util.List;
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

        User admin = userRepository.findById(userId)
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

    public java.util.List<com.nangnaidee.backend.dto.LocationListItem> getHostLocations(
            String authorizationHeader,
            Integer hostId,
            int page,
            int size
    ) {
        // 1) Authn
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new com.nangnaidee.backend.exception.UnauthorizedException("ต้องส่งโทเคนแบบ Bearer");
        }
        String token = authorizationHeader.substring("Bearer ".length()).trim();

        Integer userId;
        try {
            userId = jwtTokenProvider.getUserId(token);
        } catch (io.jsonwebtoken.JwtException | IllegalArgumentException e) {
            throw new com.nangnaidee.backend.exception.UnauthorizedException("โทเคนไม่ถูกต้องหรือหมดอายุ");
        }

        var admin = userRepository.findById(userId)
                .orElseThrow(() -> new com.nangnaidee.backend.exception.UnauthorizedException("ไม่พบผู้ใช้"));

        // 2) Authz: must be ADMIN
        java.util.Set<String> roleCodes = admin.getRoles().stream().map(com.nangnaidee.backend.model.Role::getCode).collect(java.util.stream.Collectors.toSet());
        if (!roleCodes.contains("ADMIN")) {
            throw new com.nangnaidee.backend.exception.ForbiddenException("ต้องเป็น ADMIN เท่านั้น");
        }

        // 3) Check target host exists
        var host = userRepository.findById(hostId)
                .orElseThrow(() -> new com.nangnaidee.backend.exception.NotFoundException("ไม่พบ Host ที่ระบุ"));

        // 4) Query locations
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<com.nangnaidee.backend.model.Location> locationsPage = locationRepository.findByOwner_Id(hostId, pageable);

        // 5) Map to DTO
        java.util.List<com.nangnaidee.backend.dto.LocationListItem> items = locationsPage.stream().map(l -> new com.nangnaidee.backend.dto.LocationListItem(
                l.getId(),
                l.getName(),
                l.getAddressText(),
                l.getGeoLat(),
                l.getGeoLng(),
                l.getCoverImageUrl(),
                null, // distanceKm not applicable
                l.isActive()
        )).toList();

        return items;
    }

    // helper สั้น ๆ สำหรับ code (ออปชัน)
    private String generateBookingCode(UUID bookingId) {
        // ตัวอย่างง่าย ๆ: BK-6ตัวแรกของ UUID (คุณจะใช้ Random/Sequence ก็ได้)
        return "BK-" + bookingId.toString().replace("-", "").substring(0, 6).toUpperCase();
    }


}
