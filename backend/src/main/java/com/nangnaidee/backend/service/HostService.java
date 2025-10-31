// backend/src/main/java/com/nangnaidee/backend/service/HostService.java

package com.nangnaidee.backend.service;

import com.nangnaidee.backend.config.JwtTokenProvider;
import com.nangnaidee.backend.dto.CreateDraftLocationResponse; // (เพิ่ม)
import com.nangnaidee.backend.dto.CreateLocationRequest;   // (เพิ่ม)
import com.nangnaidee.backend.dto.MeResponse;
import com.nangnaidee.backend.exception.ForbiddenException;
import com.nangnaidee.backend.exception.UnauthorizedException;
import com.nangnaidee.backend.model.Location; // (เพิ่ม)
import com.nangnaidee.backend.model.Role;
import com.nangnaidee.backend.model.User;
import com.nangnaidee.backend.repo.LocationRepository; // (เพิ่ม)
import com.nangnaidee.backend.repo.UserRepository;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // (เพิ่ม)

import java.util.List;
import java.util.Set;
import java.util.UUID; // (เพิ่ม)
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HostService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final LocationRepository locationRepository; // (เพิ่ม)

    /**
     * ดึงข้อมูลโปรไฟล์ /me ของ Host
     * @param authorizationHeader "Bearer <token>"
     * @return MeResponse
     * @throws UnauthorizedException (401) หาก Token ไม่มี, ผิดรูปแบบ หรือหมดอายุ
     * @throws ForbiddenException (403) หาก Token ถูกต้อง แต่ไม่ใช่ Role "HOST"
     */
    public MeResponse getHostProfile(String authorizationHeader) {
        // 1. ตรวจสอบ Authn (เหมือน AuthService.me)
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
                .orElseThrow(() -> new UnauthorizedException("ไม่พบผู้ใช้ (Token อาจถูกเพิกถอน)"));

        // 2. ตรวจสอบ Authz (จุดที่ต่างจาก AuthService.me)
        Set<String> roleCodes = user.getRoles().stream()
                .map(Role::getCode)
                .collect(Collectors.toSet());

        if (!roleCodes.contains("HOST")) {
            // ถ้าล็อกอินมา แต่ไม่ใช่ HOST -> 403 Forbidden
            throw new ForbiddenException("ต้องเป็นผู้ใช้ที่มีสิทธิ์ HOST เท่านั้น");
        }

        // 3. ถ้าเป็น HOST จริง ให้คืนข้อมูลโปรไฟล์ (เหมือน AuthService.me)
        List<String> rolesList = roleCodes.stream().toList();

        return new MeResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                rolesList
        );
    }

    /**
     * (เมธอดใหม่) สร้าง Location ฉบับร่าง (DRAFT) สำหรับ HOST
     * @param authorizationHeader "Bearer <token>"
     * @param request ข้อมูล Location ที่ต้องการสร้าง
     * @return CreateDraftLocationResponse
     */
    @Transactional // (เพิ่ม)
    public CreateDraftLocationResponse createDraftLocation(String authorizationHeader, CreateLocationRequest request) {
        // 1. ตรวจสอบ Authn และ Authz (ต้องเป็น HOST เท่านั้น)
        // เราสามารถเรียกใช้เมธอดเดิมเพื่อยืนยันตัวตนและสิทธิ์ได้
        MeResponse hostProfile = getHostProfile(authorizationHeader);
        User hostOwner = userRepository.findById(hostProfile.getId()).get(); // ดึง User entity ของ Host

        // 2. สร้าง Location Entity
        Location loc = new Location();
        loc.setId(UUID.randomUUID());
        loc.setOwner(hostOwner); // เจ้าของคือ HOST ที่ล็อกอินเข้ามา
        loc.setName(request.getName());
        loc.setDescription(request.getDescription());
        loc.setAddressText(request.getAddress());
        loc.setGeoLat(request.getGeoLat());
        loc.setGeoLng(request.getGeoLng());
        loc.setCoverImageUrl(request.getCoverImageUrl());

        // 3. ⭐️ จุดสำคัญ: ตั้งค่าเป็น DRAFT (ไม่ Active)
        // เราจะใช้ field `is_active` เป็นตัวกำหนด
        // DRAFT = false, PUBLISHED = true
        loc.setActive(false);

        // 4. บันทึกและคืนค่า Response DTO ใหม่
        Location saved = locationRepository.save(loc);

        return new CreateDraftLocationResponse(saved.getId(), "DRAFT");
    }
}