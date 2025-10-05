package com.nangnaidee.backend.service;

import com.nangnaidee.backend.dto.*;
import com.nangnaidee.backend.exception.ForbiddenException;
import com.nangnaidee.backend.exception.NotFoundException;
import com.nangnaidee.backend.model.Booking;
import com.nangnaidee.backend.model.LocationUnit;
import com.nangnaidee.backend.repo.BookingRepository;
import com.nangnaidee.backend.repo.LocationUnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookingService {
    private final BookingRepository bookingRepository;
    private final LocationUnitRepository unitRepository;
    private final AuthService authService;

    public CreateBookingResponse create(String authorizationHeader, CreateBookingRequest req) {
        // validate นาทีต้องเป็น 0
        OffsetDateTime start = req.getStartTime();
        if (start.getMinute() != 0 || start.getSecond() != 0 || start.getNano() != 0) {
            throw new IllegalArgumentException("startTime นาทีต้องเป็น 0 (เช่น 13:00:00)");
        }
        if (req.getHours() < 1) {
            throw new IllegalArgumentException("hours ต้องอย่างน้อย 1");
        }

        LocationUnit unit = unitRepository.findById(req.getUnitId())
                .orElseThrow(() -> new NotFoundException("ไม่พบยูนิต"));

        MeResponse me = authService.me(authorizationHeader);

        OffsetDateTime end = start.plusHours(req.getHours());
        BigDecimal total = unit.getPriceHourly().multiply(new BigDecimal(req.getHours()));

        Booking booking = new Booking();
        booking.setId(UUID.randomUUID());
        booking.setUserId(me.getId());
        booking.setLocationUnitId(unit.getId());
        booking.setStartTime(start.toLocalDateTime());
        booking.setEndTime(end.toLocalDateTime());
        booking.setHours(req.getHours());
        booking.setTotal(total);
        booking.setStatus("HOLD");
        booking.setCreatedAt(java.time.LocalDateTime.now());

        bookingRepository.save(booking);

        return new CreateBookingResponse(
                booking.getId(),
                unit.getId(),
                start,
                end,
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
                .map(booking -> new BookingListItem(
                        booking.getId(),
                        booking.getLocationUnitId(),
                        booking.getStartTime(),
                        booking.getEndTime(),
                        booking.getHours(),
                        booking.getTotal(),
                        booking.getStatus(),
                        booking.getBookingCode(),
                        booking.getCreatedAt()
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
}