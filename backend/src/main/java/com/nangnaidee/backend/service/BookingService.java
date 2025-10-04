package com.nangnaidee.backend.service;

import com.nangnaidee.backend.dto.CreateBookingRequest;
import com.nangnaidee.backend.dto.CreateBookingResponse;
import com.nangnaidee.backend.dto.MeResponse;
import com.nangnaidee.backend.exception.NotFoundException;
import com.nangnaidee.backend.model.Booking;
import com.nangnaidee.backend.model.LocationUnit;
import com.nangnaidee.backend.repo.BookingRepository;
import com.nangnaidee.backend.repo.LocationUnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

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
}