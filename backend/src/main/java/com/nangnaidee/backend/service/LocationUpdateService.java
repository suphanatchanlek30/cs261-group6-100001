// src/main/java/com/nangnaidee/backend/service/LocationUpdateService.java

package com.nangnaidee.backend.service;

import com.nangnaidee.backend.config.JwtTokenProvider;
import com.nangnaidee.backend.dto.LocationDetailResponse;
import com.nangnaidee.backend.dto.UpdateLocationRequest;
import com.nangnaidee.backend.exception.BadRequestException;
import com.nangnaidee.backend.exception.ForbiddenException;
import com.nangnaidee.backend.exception.NotFoundException;
import com.nangnaidee.backend.exception.UnauthorizedException;
import com.nangnaidee.backend.model.Location;
import com.nangnaidee.backend.model.Role;
import com.nangnaidee.backend.model.User;
import com.nangnaidee.backend.repo.LocationRepository;
import com.nangnaidee.backend.repo.LocationUnitRepository;
import com.nangnaidee.backend.repo.UserRepository;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LocationUpdateService {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final LocationUnitRepository locationUnitRepository;

    public LocationDetailResponse patch(String authorizationHeader, UUID locationId, UpdateLocationRequest req) {
        // --- Authn: ต้องมี Bearer token ---
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

        // --- โหลด location + ตรวจสิทธิ์ (HOST ต้องเป็น owner; ADMIN ผ่าน) ---
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

        // --- Apply patch (เฉพาะฟิลด์ที่ != null) ---
        boolean changed = false;

        if (req.getName() != null) {
            String name = req.getName().trim();
            if (name.isEmpty()) throw new BadRequestException("ชื่อสถานที่ห้ามว่าง");
            if (!name.equals(loc.getName())) { loc.setName(name); changed = true; }
        }
        if (req.getDescription() != null) {
            String v = req.getDescription().trim();
            String cur = loc.getDescription() == null ? "" : loc.getDescription();
            if (!v.equals(cur)) { loc.setDescription(v.isEmpty() ? null : v); changed = true; }
        }
        if (req.getAddress() != null) {
            String v = req.getAddress().trim();
            String cur = loc.getAddressText() == null ? "" : loc.getAddressText();
            if (!v.equals(cur)) { loc.setAddressText(v.isEmpty() ? null : v); changed = true; }
        }
        if (req.getGeoLat() != null && !req.getGeoLat().equals(loc.getGeoLat())) {
            loc.setGeoLat(req.getGeoLat()); changed = true;
        }
        if (req.getGeoLng() != null && !req.getGeoLng().equals(loc.getGeoLng())) {
            loc.setGeoLng(req.getGeoLng()); changed = true;
        }
        if (req.getCoverImageUrl() != null) {
            String v = req.getCoverImageUrl().trim();
            String cur = loc.getCoverImageUrl() == null ? "" : loc.getCoverImageUrl();
            if (!v.equals(cur)) { loc.setCoverImageUrl(v.isEmpty() ? null : v); changed = true; }
        }
        if (req.getIsActive() != null && loc.isActive() != req.getIsActive()) {
            loc.setActive(req.getIsActive()); changed = true;
        }

        if (!changed) {
            // ถ้าไม่ต้องการบังคับ ให้ลบบรรทัดนี้ได้
            throw new BadRequestException("ไม่มีฟิลด์ที่เปลี่ยนแปลง");
        }

        Location saved = locationRepository.save(loc);

        // --- แนบ units[] กลับเหมือน GET /api/locations/{id} ---
        var unitItems = locationUnitRepository.findByLocation_IdOrderByCodeAsc(saved.getId())
                .stream()
                .map(u -> new LocationDetailResponse.UnitItem(
                        u.getId(), u.getCode(), u.getName(),
                        u.getImageUrl(), u.getShortDesc(),
                        u.getCapacity(), u.getPriceHourly(), u.isActive()
                ))
                .toList();

        return new LocationDetailResponse(
                saved.getId(),
                saved.getOwner().getId(),
                saved.getName(),
                saved.getDescription(),
                saved.getAddressText(),
                saved.getGeoLat(),
                saved.getGeoLng(),
                saved.getCoverImageUrl(),
                saved.isActive(),
                saved.getCreatedAt(),
                unitItems
        );
    }
}
