// src/main/java/com/nangnaidee/backend/service/BookingService.java

package com.nangnaidee.backend.service;

import com.nangnaidee.backend.dto.*;
import com.nangnaidee.backend.exception.BadRequestException;
import com.nangnaidee.backend.exception.ForbiddenException;
import com.nangnaidee.backend.exception.NotFoundException;
import com.nangnaidee.backend.model.Booking;
import com.nangnaidee.backend.model.LocationUnit;
import com.nangnaidee.backend.repo.BookingOverviewRepository;
import com.nangnaidee.backend.repo.BookingRepository;
import com.nangnaidee.backend.repo.LocationUnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import com.nangnaidee.backend.dto.BookingOverviewItem.*;
import com.nangnaidee.backend.dto.BookingOverviewItem;
import com.nangnaidee.backend.dto.BookingOverviewResponse;


import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final LocationUnitRepository unitRepository;
    private final AuthService authService;
    private final BookingOverviewRepository bookingOverviewRepository;

    public CreateBookingResponse create(String authorizationHeader, CreateBookingRequest req) {
        // validate นาทีต้องเป็น 0
        OffsetDateTime start = req.getStartTime();
        if (start.getMinute() != 0 || start.getSecond() != 0 || start.getNano() != 0) {
            throw new BadRequestException("เวลาเริ่มต้นต้องเป็นจุดเต็มชั่วโมง เช่น 13:00:00");
        }
        if (req.getHours() < 1) {
            throw new BadRequestException("จำนวนชั่วโมงต้องอย่างน้อย 1 ชั่วโมง");
        }

        LocationUnit unit = unitRepository.findById(req.getUnitId())
                .orElseThrow(() -> new NotFoundException("ไม่พบยูนิต"));

        MeResponse me = authService.me(authorizationHeader);

        OffsetDateTime end = start.plusHours(req.getHours());
        BigDecimal total = unit.getPriceHourly().multiply(new BigDecimal(req.getHours()));

        var startUtc = start.withOffsetSameInstant(ZoneOffset.UTC);
        var endUtc   = end.withOffsetSameInstant(ZoneOffset.UTC);


        Booking booking = new Booking();
        booking.setId(UUID.randomUUID());
        booking.setUserId(me.getId());
        booking.setLocationUnitId(unit.getId());
        booking.setStartTime(startUtc.toLocalDateTime()); // เก็บเป็น UTC (ไม่มี offset) ใน DB
        booking.setEndTime(endUtc.toLocalDateTime());
        booking.setHours(req.getHours());
        booking.setTotal(total);
        booking.setStatus("HOLD");
        booking.setCreatedAt(java.time.LocalDateTime.now());

        bookingRepository.save(booking);

        OffsetDateTime startOut = OffsetDateTime.of(booking.getStartTime(), ZoneOffset.UTC);
        OffsetDateTime endOut   = OffsetDateTime.of(booking.getEndTime(), ZoneOffset.UTC);

        return new CreateBookingResponse(
                booking.getId(),
                unit.getId(),
                startOut,              // 2025-10-16T05:00:00Z
                endOut,                // 2025-10-16T06:00:00Z
                req.getHours(),
                total,
                booking.getStatus()
        );
    }

    public BookingListResponse getMyBookings(String authorizationHeader, String status, int page, int size) {
        MeResponse me = authService.me(authorizationHeader);
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Booking> bookingPage;
        
        if (status != null && !status.trim().isEmpty()) {
            bookingPage = bookingRepository.findByUserIdAndStatus(me.getId(), status, pageable);
        } else {
            bookingPage = bookingRepository.findByUserId(me.getId(), pageable);
        }
        
        List<BookingListItem> items = bookingPage.getContent().stream()
                .map(b -> new BookingListItem(
                        b.getId(),
                        b.getLocationUnitId(),
                        OffsetDateTime.of(b.getStartTime(), ZoneOffset.UTC),
                        OffsetDateTime.of(b.getEndTime(), ZoneOffset.UTC),
                        b.getHours(),
                        b.getTotal(),
                        b.getStatus(),
                        b.getBookingCode(),
                        b.getCreatedAt()
                ))
                .collect(Collectors.toList());
        
        return new BookingListResponse(
                items,
                bookingPage.getNumber(),
                bookingPage.getSize(),
                bookingPage.getTotalElements(),
                bookingPage.getTotalPages()
        );
    }

    public Booking getBookingDetail(String authorizationHeader, UUID bookingId) {
        MeResponse me = authService.me(authorizationHeader);
        
        // Find booking by ID
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("ไม่พบการจอง"));
        
        // Check authorization - must be owner or ADMIN
        boolean isAdmin = me.getRoles().contains("ADMIN");
        boolean isOwner = booking.getUserId().equals(me.getId());
        
        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("คุณไม่มีสิทธิ์ดูการจองนี้");
        }
        
        return booking;
    }

    public CancelBookingResponse cancelBooking(String authorizationHeader, UUID bookingId, CancelBookingRequest request) {
        MeResponse me = authService.me(authorizationHeader);
        
        // Find booking by ID
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("ไม่พบการจอง"));
        
        // Check authorization - must be owner
        if (!booking.getUserId().equals(me.getId())) {
            throw new ForbiddenException("คุณไม่มีสิทธิ์ยกเลิกการจองนี้");
        }
        
        // Check if booking can be cancelled (only non-CONFIRMED can be cancelled)
        String currentStatus = booking.getStatus();
        if ("CONFIRMED".equals(currentStatus)) {
            throw new IllegalArgumentException("ไม่สามารถยกเลิกการจองที่ได้รับการยืนยันแล้ว");
        }
        
        if ("CANCELLED".equals(currentStatus)) {
            throw new IllegalArgumentException("การจองนี้ถูกยกเลิกแล้ว");
        }
        
        // Update booking status to CANCELLED
        booking.setStatus("CANCELLED");
        bookingRepository.save(booking);
        
        return new CancelBookingResponse("CANCELLED");
    }

    // --- ใหม่: ดึง overview ---
    public BookingOverviewResponse getMyOverview(String authorization, String status, int page, int size) {
        MeResponse me = authService.me(authorization);

        Pageable pageable = PageRequest.of(page, size);
        var resultPage = bookingOverviewRepository.findMyOverview(
                me.getId(),
                (status==null || status.isBlank()) ? null : status,
                pageable
        );

        var items = resultPage.getContent().stream().map(row -> {
            int i = 0;

            var bookingId     = java.util.UUID.fromString((String) row[i++]);
            var bookingStatus = (String) row[i++];
            var bookingCode   = (String) row[i++];
            var startTime     = (java.sql.Timestamp) row[i++];   // LocalDateTime
            var endTime       = (java.sql.Timestamp) row[i++];
            var hours         = ((Number) row[i++]).intValue();
            var total         = (java.math.BigDecimal) row[i++];

            var unitId   = java.util.UUID.fromString((String) row[i++]);
            var unitCode = (String) row[i++];
            var unitName = (String) row[i++];
            var unitImg  = (String) row[i++];
            var capacity = row[i++] == null ? null : ((Number) row[i-1]).intValue();
            var shortDesc= (String) row[i++];

            var locId    = java.util.UUID.fromString((String) row[i++]);
            var locName  = (String) row[i++];
            var address  = (String) row[i++];
            var lat      = row[i++] == null ? null : ((Number) row[i-1]).doubleValue();
            var lng      = row[i++] == null ? null : ((Number) row[i-1]).doubleValue();
            var coverUrl = (String) row[i++];

            var payIdStr   = (String) row[i++]; // nullable
            var payStatus  = (String) row[i++];
            var proofUrl   = (String) row[i++];

            var avgRating  = row[i++] == null ? null : ((Number) row[i-1]).doubleValue();
            var cntRating  = row[i++] == null ? null : ((Number) row[i-1]).longValue();

            var reviewIdStr= (String) row[i++]; // nullable

            var bookingDto = new BookingDto(
                    bookingId, bookingStatus, bookingCode,
                    BookingOverviewItem.utc(startTime.toLocalDateTime()),
                    BookingOverviewItem.utc(endTime.toLocalDateTime()),
                    hours, total
            );

            var unitDto = new UnitDto(unitId, unitCode, unitName, unitImg, capacity, shortDesc);
            var locDto  = new LocationDto(locId, locName, address, lat, lng, coverUrl);
            var paymentDto = new PaymentDto(
                    payIdStr == null ? null : java.util.UUID.fromString(payIdStr),
                    payStatus, proofUrl
            );
            boolean hasReview = (reviewIdStr != null);
            var reviewDto = new ReviewDto(
                    // เงื่อนไขรีวิว: จองต้อง CONFIRMED และเลยเวลา end แล้ว และยังไม่เคยรีวิว
                    "CONFIRMED".equals(bookingStatus) &&
                            java.time.OffsetDateTime.now().isAfter(
                                    BookingOverviewItem.utc(endTime.toLocalDateTime())
                            ) &&
                            !hasReview,
                    hasReview ? java.util.UUID.fromString(reviewIdStr) : null,
                    avgRating, cntRating
            );

            // ปุ่ม action: ตัดสินใจง่าย ๆ ตามสเตตัส/การชำระเงิน
            boolean canPay = "HOLD".equals(bookingStatus);
            boolean canCancel = "HOLD".equals(bookingStatus) || "PENDING_REVIEW".equals(bookingStatus);
            boolean canUploadProof =
                    paymentDto.getPaymentId() != null &&
                            "PENDING".equals(paymentDto.getStatus()) &&
                            (paymentDto.getProofUrl() == null || paymentDto.getProofUrl().isBlank());

            var actions = new BookingOverviewItem.Actions(canPay, canCancel, canUploadProof);

            return new BookingOverviewItem(bookingDto, unitDto, locDto, paymentDto, reviewDto, actions);
        }).toList();

        return new BookingOverviewResponse(
                items,
                resultPage.getNumber(),
                resultPage.getSize(),
                resultPage.getTotalElements(),
                resultPage.getTotalPages()
        );
    }
}