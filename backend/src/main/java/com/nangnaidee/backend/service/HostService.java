// backend/src/main/java/com/nangnaidee/backend/service/HostService.java

package com.nangnaidee.backend.service;

import com.nangnaidee.backend.config.JwtTokenProvider;
import com.nangnaidee.backend.dto.MeResponse;
import com.nangnaidee.backend.exception.ForbiddenException;
import com.nangnaidee.backend.exception.UnauthorizedException;
import com.nangnaidee.backend.model.Role;
import com.nangnaidee.backend.model.User;
import com.nangnaidee.backend.repo.UserRepository;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class HostService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

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
}