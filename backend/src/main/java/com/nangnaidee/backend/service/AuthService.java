package com.nangnaidee.backend.service;

import com.nangnaidee.backend.dto.RegisterRequest;
import com.nangnaidee.backend.dto.RegisterResponse;
import com.nangnaidee.backend.exception.EmailAlreadyExistsException;
import com.nangnaidee.backend.exception.InvalidRoleException;
import com.nangnaidee.backend.model.Role;
import com.nangnaidee.backend.model.User;
import com.nangnaidee.backend.repo.RoleRepository;
import com.nangnaidee.backend.repo.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;


@Service
@RequiredArgsConstructor
public class AuthService {


    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;


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


        return new RegisterResponse(
                "ลงทะเบียนสำเร็จ",
                new RegisterResponse.UserInfo(
                        savedUser.getId(),
                        savedUser.getEmail(),
                        savedUser.getRoles().stream().map(Role::getCode).toList()
                )
        );
    }
}
