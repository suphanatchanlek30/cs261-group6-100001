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
import com.nangnaidee.backend.dto.BookingDetailResponse;
import com.nangnaidee.backend.dto.BookingOverviewItem;
import com.nangnaidee.backend.dto.BookingOverviewItem.*;
import com.nangnaidee.backend.repo.BookingDetailRepository;
import com.nangnaidee.backend.dto.BookingDetailResponse;
import com.nangnaidee.backend.repo.BookingDetailRepository;
import java.time.ZoneOffset;

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
    private final BookingDetailRepository bookingDetailRepository;

    // อัปเดต: รองรับ UUID ทั้งที่เป็น UUID/String/byte[]/Object[]
    private java.util.UUID asUuid(Object o) {
        if (o == null) return null;
        if (o instanceof java.util.UUID u) return u;
        if (o instanceof String s) return java.util.UUID.fromString(s);
        if (o instanceof byte[] bytes) return java.util.UUID.nameUUIDFromBytes(bytes);
        if (o instanceof Object[] arr && arr.length > 0) return asUuid(arr[0]);
        throw new IllegalStateException("Unsupported UUID type: " + o.getClass());
    }

    // อัปเดต: รองรับ Timestamp/LocalDateTime/OffsetDateTime
    private java.time.OffsetDateTime asUtc(Object o) {
        if (o == null) return null;
        if (o instanceof java.sql.Timestamp ts) {
            return ts.toInstant().atOffset(java.time.ZoneOffset.UTC);
        }
        if (o instanceof java.time.LocalDateTime ldt) {
            return ldt.atOffset(java.time.ZoneOffset.UTC);
        }
        if (o instanceof java.time.OffsetDateTime odt) {
            return odt.withOffsetSameInstant(java.time.ZoneOffset.UTC);
        }
        throw new IllegalStateException("Unsupported datetime type: " + o.getClass());
    }

    private java.math.BigDecimal asBigDecimal(Object o) {
        if (o == null) return null;
        if (o instanceof java.math.BigDecimal bd) return bd;
        if (o instanceof Number n) return java.math.BigDecimal.valueOf(n.doubleValue());
        throw new IllegalStateException("Unsupported BigDecimal type: " + o.getClass());
    }
    private Integer asInt(Object o) {
        if (o == null) return null;
        if (o instanceof Number n) return n.intValue();
        throw new IllegalStateException("Unsupported Integer type: " + o.getClass());
    }
    private Long asLong(Object o) {
        if (o == null) return null;
        if (o instanceof Number n) return n.longValue();
        throw new IllegalStateException("Unsupported Long type: " + o.getClass());
    }
    private Double asDouble(Object o) {
        if (o == null) return null;
        if (o instanceof Number n) return n.doubleValue();
        throw new IllegalStateException("Unsupported Double type: " + o.getClass());
    }

    // เพิ่มใหม่: กันเคส native query คืนค่าแบบซ้อน Object[][] (แถวเดียวแต่ห่อ)
    private Object[] flattenRow(Object[] row) {
        if (row != null && row.length == 1 && row[0] instanceof Object[]) {
            return (Object[]) row[0];
        }
        return row;
    }


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

    public BookingDetailResponse getBookingDetailDto(String authorizationHeader, UUID bookingId) {
        MeResponse me = authService.me(authorizationHeader);

        // เช็คว่ามี booking จริง
        Booking bookingEntity = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("ไม่พบการจอง"));

        // owner or ADMIN เท่านั้น
        boolean isAdmin = me.getRoles().contains("ADMIN");
        boolean isOwner = bookingEntity.getUserId().equals(me.getId());
        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("คุณไม่มีสิทธิ์ดูการจองนี้");
        }

        Object[] row = bookingDetailRepository.findDetailById(bookingId)
                .orElseThrow(() -> new NotFoundException("ไม่พบรายละเอียดการจอง"));

        // สำคัญ: คลาย nested array ก่อน map
        row = flattenRow(row);

        int i = 0;

        // booking
        var bId        = asUuid(row[i++]);
        var bStatus    = (String) row[i++];
        var bCode      = (String) row[i++];
        var bStartZ    = asUtc(row[i++]);
        var bEndZ      = asUtc(row[i++]);
        var bHours     = asInt(row[i++]);
        var bTotal     = asBigDecimal(row[i++]);

        // unit
        var uId        = asUuid(row[i++]);
        var uCode      = (String) row[i++];
        var uName      = (String) row[i++];
        var uImg       = (String) row[i++];
        var uCap       = asInt(row[i++]);
        var uShortDesc = (String) row[i++];

        // location
        var lId        = asUuid(row[i++]);
        var lName      = (String) row[i++];
        var lAddr      = (String) row[i++];
        var lLat       = asDouble(row[i++]);
        var lLng       = asDouble(row[i++]);
        var lCover     = (String) row[i++];

        // payment
        var pId        = asUuid(row[i++]);      // may be null
        var pStatus    = (String) row[i++];
        var pProof     = (String) row[i++];

        // rating agg
        var avgRating  = row[i] == null ? null : asDouble(row[i]); i++;
        var reviewCnt  = row[i] == null ? null : asLong(row[i]);   i++;

        // my review id (ถ้ามี)
        var myReviewId = asUuid(row[i++]);      // may be null

        var booking = new BookingDetailResponse.BookingDto(
                bId, bStatus, bCode, bStartZ, bEndZ, bHours, bTotal
        );
        var unit = new BookingDetailResponse.UnitDto(
                uId, uCode, uName, uImg, uCap, uShortDesc
        );
        var location = new BookingDetailResponse.LocationDto(
                lId, lName, lAddr, lLat, lLng, lCover, avgRating, reviewCnt
        );
        var payment = new BookingDetailResponse.PaymentDto(
                pId, pStatus, pProof
        );

        boolean finished = bEndZ != null && java.time.OffsetDateTime.now(java.time.ZoneOffset.UTC).isAfter(bEndZ);
        boolean canWriteReview = "CONFIRMED".equals(bStatus) && finished && myReviewId == null;

        var review = new BookingDetailResponse.ReviewDto(
                canWriteReview, myReviewId
        );

        // ระวังลำดับฟิลด์ใน DTO Actions: canCancel, canPay, canUploadSlip
        var actions = new BookingDetailResponse.Actions(
                /* canCancel     */ "HOLD".equals(bStatus),
                /* canPay        */ "HOLD".equals(bStatus) || "PENDING_REVIEW".equals(bStatus),
                /* canUploadSlip */ pId != null && "PENDING".equals(pStatus) && (pProof == null || pProof.isBlank())
        );

        return new BookingDetailResponse(booking, unit, location, payment, review, actions);
    }
}