// src/main/java/com/nangnaidee/backend/service/LocationService.java

package com.nangnaidee.backend.service;

import com.nangnaidee.backend.config.JwtTokenProvider;
import com.nangnaidee.backend.dto.CreateLocationRequest;
import com.nangnaidee.backend.dto.CreateLocationResponse;
import com.nangnaidee.backend.exception.ForbiddenException;
import com.nangnaidee.backend.exception.UnauthorizedException;
import com.nangnaidee.backend.model.Location;
import com.nangnaidee.backend.model.Role;
import com.nangnaidee.backend.model.User;
import com.nangnaidee.backend.repo.LocationRepository;
import com.nangnaidee.backend.repo.UserRepository;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class LocationService {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final LocationRepository locationRepository;

    public CreateLocationResponse create(String authorizationHeader, CreateLocationRequest req) {
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

        User actor = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("ไม่พบผู้ใช้"));

        // 2) Authz: ต้องมีบทบาท HOST หรือ ADMIN
        Set<String> roleCodes = actor.getRoles().stream().map(Role::getCode).collect(java.util.stream.Collectors.toSet());
        boolean isAdmin = roleCodes.contains("ADMIN");
        boolean isHost  = roleCodes.contains("HOST");
        if (!(isAdmin || isHost)) {
            throw new ForbiddenException("ต้องเป็น HOST หรือ ADMIN เท่านั้น");
        }

        // 3) Owner rule:
        //    - HOST: ห้ามส่ง ownerId, owner = ตัวเอง
        //    - ADMIN: ส่ง ownerId ได้; ถ้าไม่ส่ง ownerId ให้ owner = ตัวเอง (ก็ได้)
        User owner;
        if (isHost) {
            if (req.getOwnerId() != null && !req.getOwnerId().equals(actor.getId())) {
                throw new ForbiddenException("HOST ห้ามกำหนด owner เป็นผู้อื่น");
            }
            owner = actor; // เจ้าตัวเอง
        } else { // ADMIN
            if (req.getOwnerId() != null) {
                owner = userRepository.findById(req.getOwnerId())
                        .orElseThrow(() -> new ForbiddenException("ownerId ไม่ถูกต้อง"));
            } else {
                owner = actor; // ไม่ส่ง ownerId ก็ให้เป็นตัวเองได้
            }
        }

        // 4) สร้าง Location และบันทึก
        Location loc = new Location();
        loc.setId(UUID.randomUUID());
        loc.setOwner(owner);
        loc.setName(req.getName());
        loc.setDescription(req.getDescription());
        loc.setAddressText(req.getAddress());
        loc.setGeoLat(req.getGeoLat());
        loc.setGeoLng(req.getGeoLng());
        loc.setCoverImageUrl(req.getCoverImageUrl());
        // isActive = true, createdAt = now (ค่า default ใน entity)

        Location saved = locationRepository.save(loc);
        return new CreateLocationResponse("สร้างสถานที่สำเร็จ", saved.getId());
    }
}
