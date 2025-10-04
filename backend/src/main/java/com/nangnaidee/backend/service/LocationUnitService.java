// src/main/java/com/nangnaidee/backend/service/LocationUnitService.java
package com.nangnaidee.backend.service;

import com.nangnaidee.backend.config.JwtTokenProvider;
import com.nangnaidee.backend.dto.CreateUnitRequest;
import com.nangnaidee.backend.dto.CreateUnitResponse;
import com.nangnaidee.backend.dto.UpdateUnitRequest;
import com.nangnaidee.backend.dto.UpdateUnitResponse;
import com.nangnaidee.backend.exception.ConflictException;
import com.nangnaidee.backend.exception.ForbiddenException;
import com.nangnaidee.backend.exception.NotFoundException;
import com.nangnaidee.backend.exception.UnauthorizedException;
import com.nangnaidee.backend.model.Location;
import com.nangnaidee.backend.model.LocationUnit;
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
public class LocationUnitService {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;
    private final LocationUnitRepository locationUnitRepository;

    public CreateUnitResponse createUnit(String authorizationHeader, UUID locationId, CreateUnitRequest req) {
        // 1) ตรวจโทเคน
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

        // 2) โหลด Location และตรวจสิทธิ์
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new NotFoundException("ไม่พบสถานที่"));

        Set<String> roles = actor.getRoles().stream().map(Role::getCode).collect(Collectors.toSet());
        boolean isAdmin = roles.contains("ADMIN");
        boolean isHost  = roles.contains("HOST");

        if (!(isAdmin || isHost)) {
            throw new ForbiddenException("ต้องเป็น HOST หรือ ADMIN เท่านั้น");
        }
        // HOST ต้องเป็น owner ของ location
        if (isHost && !location.getOwner().getId().equals(actor.getId())) {
            throw new ForbiddenException("ไม่ใช่เจ้าของสถานที่นี้");
        }

        // 3) ตรวจ code ซ้ำใน location
        if (locationUnitRepository.existsByLocation_IdAndCodeIgnoreCase(locationId, req.getCode())) {
            throw new ConflictException("รหัสยูนิตนี้มีอยู่แล้วในสถานที่");
        }

        // 4) สร้างและบันทึก
        LocationUnit unit = new LocationUnit();
        unit.setId(UUID.randomUUID());
        unit.setLocation(location);
        unit.setCode(req.getCode().trim());
        unit.setName(req.getName());
        unit.setImageUrl(req.getImageUrl());
        unit.setShortDesc(req.getShortDesc());
        unit.setCapacity(req.getCapacity());
        unit.setPriceHourly(req.getPriceHourly());
        unit.setActive(true);

        LocationUnit saved = locationUnitRepository.save(unit);
        return new CreateUnitResponse(saved.getId());
    }

    public UpdateUnitResponse updateUnit(String authorizationHeader, UUID unitId, UpdateUnitRequest req) {
        // 1) ตรวจโทเคน
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

        // 2) หา unit ที่ต้องการแก้ไข
        LocationUnit unit = locationUnitRepository.findById(unitId)
                .orElseThrow(() -> new NotFoundException("ไม่พบยูนิต"));

        // 3) ตรวจสอบสิทธิ์ - ต้องเป็น owner หรือ ADMIN
        Set<String> roleCodes = actor.getRoles().stream()
                .map(Role::getCode)
                .collect(Collectors.toSet());

        boolean isAdmin = roleCodes.contains("ADMIN");
        boolean isOwner = unit.getLocation().getOwner().getId().equals(actorId);

        if (!isAdmin && !isOwner) {
            throw new ForbiddenException("คุณไม่มีสิทธิ์แก้ไขยูนิตนี้");
        }

        // 4) Update เฉพาะฟิลด์ที่ส่งมา (partial update)
        if (req.getName() != null) {
            unit.setName(req.getName());
        }
        if (req.getImageUrl() != null) {
            unit.setImageUrl(req.getImageUrl());
        }
        if (req.getShortDesc() != null) {
            unit.setShortDesc(req.getShortDesc());
        }
        if (req.getCapacity() != null) {
            unit.setCapacity(req.getCapacity());
        }
        if (req.getPriceHourly() != null) {
            unit.setPriceHourly(req.getPriceHourly());
        }
        if (req.getIsActive() != null) {
            unit.setActive(req.getIsActive());
        }

        LocationUnit saved = locationUnitRepository.save(unit);
        
        return new UpdateUnitResponse(
                saved.getId(),
                saved.getCode(),
                saved.getName(),
                saved.getImageUrl(),
                saved.getShortDesc(),
                saved.getCapacity(),
                saved.getPriceHourly(),
                saved.isActive()
        );
    }
}
