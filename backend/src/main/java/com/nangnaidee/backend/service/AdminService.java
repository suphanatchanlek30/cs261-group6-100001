package com.nangnaidee.backend.service;

import com.nangnaidee.backend.config.JwtTokenProvider;
import com.nangnaidee.backend.dto.GetPaymentItemDto;
import com.nangnaidee.backend.dto.GetPaymentResponse;
import com.nangnaidee.backend.dto.PatchPaymentRequest;
import com.nangnaidee.backend.dto.PatchPaymentResponse;
import com.nangnaidee.backend.exception.NotFoundException;
import com.nangnaidee.backend.exception.ForbiddenException;
import com.nangnaidee.backend.exception.UnauthorizedException;
import com.nangnaidee.backend.exception.UnprocessableEntityException;
import com.nangnaidee.backend.model.Payment;
import com.nangnaidee.backend.model.Role;
import com.nangnaidee.backend.model.User;
import com.nangnaidee.backend.repo.PaymentRepository;
import com.nangnaidee.backend.repo.UserRepository;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;


import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    @Transactional
    public GetPaymentResponse getPayments(String authorizationHeader, String status, int page, int size) {

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
        if (!roleCodes.contains("ADMIN")) {
            throw new ForbiddenException("ต้องเป็น ADMIN เท่านั้น");
        }

        // 3) Pagination + Filter
        Pageable pageable = PageRequest.of(page, size);
        Page<Payment> paymentsPage;

        if (status == null || status.isBlank()) {
            paymentsPage = paymentRepository.findAll(pageable);
        } else {
            paymentsPage = paymentRepository.findByStatus(status.toUpperCase(), pageable);
        }

        // 4) Mapping Payment -> GetPaymentItemDto
        List<GetPaymentItemDto> items = paymentsPage.stream()
                .map(p -> new GetPaymentItemDto(
                        p.getId(),
                        p.getBooking().getId(),
                        p.getMethod(),
                        p.getAmount(),
                        p.getStatus(),
                        p.getProofUrl(),
                        p.getReviewedBy() != null ? p.getReviewedBy().getId() : null,
                        p.getReviewedAt(),
                        p.getCreatedAt()))
                .toList();

        // 5) Return DTO
        return new GetPaymentResponse(
                items,
                paymentsPage.getNumber(),
                paymentsPage.getSize(),
                paymentsPage.getTotalElements());
    }

    public PatchPaymentResponse approvePayment(String authorizationHeader, UUID paymentId, PatchPaymentRequest req) {

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

        Set<String> roleCodes = admin.getRoles().stream()
                .map(Role::getCode)
                .collect(Collectors.toSet());
        if (!roleCodes.contains("ADMIN")) {
            throw new ForbiddenException("ต้องเป็น ADMIN เท่านั้น");
        }

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NotFoundException("ไม่พบรายการชำระเงินนี้ในระบบ"));

        if (payment.getStatus().equals("APPROVED") || payment.getStatus().equals("REJECTED")) {
            throw new UnprocessableEntityException("ไม่สามารถแก้ไข Payment ที่อนุมัติหรือปฏิเสธแล้ว");
        }

        payment.setStatus(req.getStatus());

        Payment savedPayment = paymentRepository.save(payment);

        return new PatchPaymentResponse(
                savedPayment.getStatus(),
                savedPayment.getBooking().getStatus(),
                savedPayment.getBooking().getId());

    }
    
}
