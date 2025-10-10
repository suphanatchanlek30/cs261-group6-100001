// src/main/java/com/nangnaidee/backend/service/PaymentService.java

package com.nangnaidee.backend.service;

import com.nangnaidee.backend.config.JwtTokenProvider;
import com.nangnaidee.backend.dto.CreatePaymentRequest;
import com.nangnaidee.backend.dto.CreatePaymentResponse;
import com.nangnaidee.backend.dto.ProofPaymentRequest;
import com.nangnaidee.backend.dto.ProofPaymentResponse;
import com.nangnaidee.backend.exception.NotFoundException;
import com.nangnaidee.backend.exception.ConflictException;
import com.nangnaidee.backend.exception.ForbiddenException;
import com.nangnaidee.backend.exception.UnauthorizedException;
import com.nangnaidee.backend.exception.BadRequestException;
import com.nangnaidee.backend.model.Booking;
import com.nangnaidee.backend.model.Payment;
import com.nangnaidee.backend.model.User;
import com.nangnaidee.backend.repo.BookingRepository;
import com.nangnaidee.backend.repo.PaymentRepository;
import com.nangnaidee.backend.repo.UserRepository;

import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor

public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Transactional
    public CreatePaymentResponse create(String authorizationHeader, CreatePaymentRequest req) {

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

        UUID bookingId = req.getBookingId();

        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new NotFoundException("Booking ID ไม่พบ"));

        if (!userId.equals(booking.getUserId())) {
            throw new UnauthorizedException("คุณไม่ใช่เจ้าของ Booking นี้");
        }

        // if (paymentRepository.existsByBookingId(bookingId)) {
        // throw new ConflictException("Payment สำหรับ Booking นี้มีอยู่แล้ว");
        // }

        var existingOpt = paymentRepository.findByBookingId(bookingId);
        if (existingOpt.isPresent()) {
            Payment existing = existingOpt.get();

            // กรณี 1: ยังอยู่สถานะ PENDING และยังไม่แนบสลิป → อนุญาต "กดสร้าง QR ซ้ำ"
            // โดยคืนตัวเดิม
            if ("PENDING".equals(existing.getStatus())
                    && (existing.getProofUrl() == null || existing.getProofUrl().isBlank())) {
                // (ออปชัน) ถ้าคุณมีฟิลด์สำหรับ QR เช่น qrPayload/qrExpiresAt ให้ "ออก QR ใหม่"
                // ที่นี่ได้
                // existing.setQrPayload(generateNewQr(...));
                // existing.setQrExpiresAt(LocalDateTime.now().plusMinutes(15));
                Payment saved = paymentRepository.save(existing);
                return new CreatePaymentResponse(saved.getId(), saved.getStatus(), saved.getAmount());
            }

            // กรณี 2: ถ้าสถานะเป็น REJECTED แล้วอยากให้ “เริ่มใหม่” ก็รีเซ็ตกลับ PENDING
            // ได้ (ออปชัน)
            // uncomment ถ้าต้องการรองรับ flow นี้
            /*
             * if ("REJECTED".equals(existing.getStatus())) {
             * existing.setStatus("PENDING");
             * existing.setProofUrl(null);
             * Payment saved = paymentRepository.save(existing);
             * return new CreatePaymentResponse(saved.getId(), saved.getStatus(),
             * saved.getAmount());
             * }
             */

            // กรณี 3: ถ้า APPROVED แล้ว / แนบสลิปแล้ว → ไม่อนุญาตสร้าง/กดซ้ำ
            throw new ConflictException("Payment สำหรับ Booking นี้ดำเนินการไปแล้ว");
        }

        // สร้าง Payment โดยไม่ set id เอง
        Payment payment = new Payment();
        payment.setBooking(booking);
        payment.setAmount(booking.getTotal());
        payment.setProofUrl(null); // ยังไม่แนบสลิป
        payment.setStatus("PENDING");
        // payment.setProofUrl("http://cloudinary");
        payment.setCreatedAt(LocalDateTime.now());

        Payment savedPayment = paymentRepository.save(payment);

        return new CreatePaymentResponse(
                savedPayment.getId(),
                savedPayment.getStatus(),
                savedPayment.getAmount());
    }

    @Transactional
    public ProofPaymentResponse proof(String authorizationHeader, UUID paymentId, ProofPaymentRequest req) {

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            throw new UnauthorizedException("ต้องส่งโทเคนแบบ Bearer");
        }

        String token = authorizationHeader.substring("Bearer".length()).trim();
        Integer userId;

        try {
            userId = jwtTokenProvider.getUserId(token);
        } catch (JwtException | IllegalArgumentException e) {
            throw new UnauthorizedException("โทเคนไม่ถูกต้องหรือหมดอายุ");
        }

        User actor = userRepository.findById(userId)
                .orElseThrow(() -> new UnauthorizedException("ไม่พบผู้ใช้"));

        if (req.getProofUrl() == null || req.getProofUrl().isBlank()) {
            throw new BadRequestException("กรุณาระบุ URL ของสลิปการโอนเงิน");
        }

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new NotFoundException("ไม่พบรายการชำระเงินนี้ในระบบ"));

        Booking booking = payment.getBooking();
        if (booking.getUserId() == null || !booking.getUserId().equals(userId)) {
            throw new ForbiddenException("คุณไม่ใช่เจ้าของ Booking นี้");
        }

        String url = req.getProofUrl().trim();
        try {
            new java.net.URL(url); // เช็คว่าเป็น URL รูปแบบถูก
        } catch (Exception e) {
            throw new BadRequestException("รูปแบบ URL ไม่ถูกต้อง");
        }

        payment.setProofUrl(req.getProofUrl());
        Payment savedPayment = paymentRepository.save(payment);

        return new ProofPaymentResponse(
                savedPayment.getStatus());

    }
}
