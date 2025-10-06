// src/main/java/com/nangnaidee/backend/service/AuthService.java

package com.nangnaidee.backend.service;

import com.nangnaidee.backend.dto.MeResponse;
import com.nangnaidee.backend.exception.UnauthorizedException;
import io.jsonwebtoken.JwtException;
import com.nangnaidee.backend.config.JwtTokenProvider;
import com.nangnaidee.backend.dto.LoginRequest;
import com.nangnaidee.backend.dto.LoginResponse;
import com.nangnaidee.backend.dto.RegisterRequest;
import com.nangnaidee.backend.dto.RegisterResponse;
import com.nangnaidee.backend.exception.EmailAlreadyExistsException;
import com.nangnaidee.backend.exception.InvalidCredentialsException;
import com.nangnaidee.backend.exception.InvalidRoleException;
import com.nangnaidee.backend.model.Role;
import com.nangnaidee.backend.model.User;
import com.nangnaidee.backend.repo.RoleRepository;
import com.nangnaidee.backend.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AuthService {


    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    // -------- REGISTER --------
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("อีเมลนี้ถูกใช้งานแล้ว");
        }


        Role role = roleRepository.findByCode(request.getRole().toUpperCase())
                .orElseThrow(() -> new InvalidRoleException("บทบาทไม่ถูกต้อง ต้องเป็น USER หรือ HOST เท่านั้น"));


        if (!role.getCode().equals("USER") && !role.getCode().equals("HOST")) {
            throw new InvalidRoleException("บทบาทต้องเป็น USER หรือ HOST เท่านั้น");
        }


        User user = new User();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setActive(true);
        user.getRoles().add(role);


        User savedUser = userRepository.save(user);

        // คัดลอกออกมาก่อนค่อย map
        List<String> roleCodes = new ArrayList<>(savedUser.getRoles())
                .stream().map(Role::getCode).toList();

        return new RegisterResponse(
                "ลงทะเบียนสำเร็จ",
                new RegisterResponse.UserInfo(
                        savedUser.getId(),
                        savedUser.getEmail(),
                        roleCodes
                )
        );
    }

    // -------- LOGIN --------
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("อีเมลหรือรหัสผ่านไม่ถูกต้อง"));

        if (!user.isActive()) {
            throw new InvalidCredentialsException("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        }

        if (user.getPasswordHash() == null ||
                !passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new InvalidCredentialsException("อีเมลหรือรหัสผ่านไม่ถูกต้อง");
        }

        List<String> roles = user.getRoles().stream().map(Role::getCode).toList();

        Map<String, Object> claims = new HashMap<>();
        claims.put("email", user.getEmail());
        claims.put("fullName", user.getFullName());
        claims.put("roles", roles);

        String token = jwtTokenProvider.generateToken(String.valueOf(user.getId()), claims);

        return new LoginResponse(
                token,
                "Bearer",
                jwtTokenProvider.getExpirationMillis(),
                roles
        );
    }

    // -------- ME --------
    public MeResponse me(String authorizationHeader) {
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

        var user = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("ไม่พบผู้ใช้"));

        // คัดลอก roles ออกมาก่อนเพื่อความปลอดภัยเวลา map
        var roleCodes = new java.util.ArrayList<>(user.getRoles())
                .stream().map(Role::getCode).toList();

        return new MeResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                roleCodes
        );
    }
}
