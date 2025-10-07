// src/main/java/com/nangnaidee/backend/service/LocationDeleteService.java

package com.nangnaidee.backend.service;

import com.nangnaidee.backend.config.JwtTokenProvider;
import com.nangnaidee.backend.exception.ConflictException;
import com.nangnaidee.backend.exception.ForbiddenException;
import com.nangnaidee.backend.exception.NotFoundException;
import com.nangnaidee.backend.exception.UnauthorizedException;
import com.nangnaidee.backend.model.Location;
import com.nangnaidee.backend.model.Role;
import com.nangnaidee.backend.model.User;
import com.nangnaidee.backend.repo.BookingRepository;
import com.nangnaidee.backend.repo.LocationRepository;
import com.nangnaidee.backend.repo.UserRepository;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import lombok.extern.slf4j.Slf4j;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j // <--- เพิ่ม
@Service
@RequiredArgsConstructor
public class LocationDeleteService {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final BookingRepository bookingRepository;

    public void delete(String authorizationHeader, UUID locationId) {
        // --- Authn ---
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("ต้องส่งโทเคนแบบ Bearer");
        }
        String token = authorizationHeader.substring("Bearer ".length()).trim();

        Integer actorId;
        try {
            actorId = jwtTokenProvider.getUserId(token);
        } catch (JwtException | IllegalArgumentException e) {
            throw new UnauthorizedException("โทเคนไม่ถูกต้องหรือหมดอายุ");
        }

        User actor = userRepository.findById(actorId)
                .orElseThrow(() -> new UnauthorizedException("ไม่พบผู้ใช้"));

        // --- Find & Authz ---
        Location loc = locationRepository.findById(locationId)
                .orElseThrow(() -> new NotFoundException("ไม่พบสถานที่"));

        Set<String> roles = actor.getRoles().stream().map(Role::getCode).collect(Collectors.toSet());
        boolean isAdmin = roles.contains("ADMIN");
        boolean isHost  = roles.contains("HOST");

        if (!(isAdmin || isHost)) {
            throw new ForbiddenException("ต้องเป็น HOST หรือ ADMIN เท่านั้น");
        }
        if (isHost && !loc.getOwner().getId().equals(actor.getId())) {
            throw new ForbiddenException("ไม่ใช่เจ้าของสถานที่นี้");
        }

        // --- Pre-check dependencies: bookings ที่พ่วงกับยูนิตของ location นี้ ---
        long bookingCount = bookingRepository.countByLocationId(locationId);
        if (bookingCount > 0) {
            log.warn("ลบสถานที่ไม่ได้ (มี bookings) locationId={}, userId={}, bookings={}",
                    locationId, actor.getId(), bookingCount); // <--- log ตอน 409
            throw new ConflictException("ลบไม่ได้: มีการจองที่เกี่ยวข้องอยู่");
        }

        // --- Delete (ถ้ายังมี FK อื่น ๆ จะจับเพิ่มด้วย catch ด้านล่าง) ---
        try {
            locationRepository.delete(loc);
            log.info("ลบสถานที่สำเร็จ locationId={} โดย userId={}",  // <--- log สำเร็จ
                    locationId, actor.getId());
            // 204/200 ให้ controller ตัดสินใจตอบ
        } catch (DataIntegrityViolationException ex) {
            log.error("ลบสถานที่ไม่ได้ (FK ติด) locationId={}, userId={}, error={}",
                    locationId, actor.getId(), ex.getMessage()); // <--- log error
            throw new ConflictException("ลบไม่ได้: มีข้อมูลที่พ่วงอยู่ในระบบ");
        }

    }
}
