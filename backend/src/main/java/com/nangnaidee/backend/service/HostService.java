package com.nangnaidee.backend.service;

import com.nangnaidee.backend.config.JwtTokenProvider;
import com.nangnaidee.backend.dto.*;
import com.nangnaidee.backend.exception.BadRequestException;
import com.nangnaidee.backend.exception.ForbiddenException;
import com.nangnaidee.backend.exception.NotFoundException;
import com.nangnaidee.backend.exception.UnauthorizedException;
import com.nangnaidee.backend.model.Booking;
import com.nangnaidee.backend.model.Location;
import com.nangnaidee.backend.model.LocationUnit;
import com.nangnaidee.backend.model.Role;
import com.nangnaidee.backend.model.User;
import com.nangnaidee.backend.repo.BookingOverviewRepository;
import com.nangnaidee.backend.repo.BookingRepository;
import com.nangnaidee.backend.repo.HostRevenueSummaryRepository;
import com.nangnaidee.backend.repo.LocationRepository;
import com.nangnaidee.backend.repo.LocationUnitRepository;
import com.nangnaidee.backend.repo.UserRepository;

import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;


import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HostService {

    private final BookingOverviewRepository bookingOverviewRepository;
    private final LocationRepository locationRepository;
    private final LocationUnitRepository locationUnitRepository;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final BookingRepository bookingRepository;
    private final HostRevenueSummaryRepository hostRevenueSummaryRepository;

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

        // 4) ตรวจสอบ groupBy
        if (!"day".equals(groupBy)) {
            throw new BadRequestException("groupBy ต้องเป็น 'day' เท่านั้น");
        }

        // 5) Query ข้อมูล
        List<Object[]> results = hostRevenueSummaryRepository.findRevenueSummaryByDay(
            userId, from, to
        );

        // 6) แปลงข้อมูล
        return results.stream()
            .map(row -> HostRevenueSummaryResponse.builder()
                .date(((java.sql.Date) row[0]).toLocalDate().atStartOfDay())
                .totalRevenue((BigDecimal) row[1])
                .totalBookings(((Number) row[2]).intValue())
                .build())
            .collect(Collectors.toList());
    }

}
