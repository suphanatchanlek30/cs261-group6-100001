package com.nangnaidee.backend.service;

import com.nangnaidee.backend.config.JwtTokenProvider;
import com.nangnaidee.backend.dto.AdminTransactionResponseDto;
import com.nangnaidee.backend.exception.ForbiddenException;
import com.nangnaidee.backend.exception.UnauthorizedException;
import com.nangnaidee.backend.model.Booking;
import com.nangnaidee.backend.model.Location;
import com.nangnaidee.backend.model.LocationUnit;
import com.nangnaidee.backend.model.Payment;
import com.nangnaidee.backend.model.Role;
import com.nangnaidee.backend.model.User;
import com.nangnaidee.backend.repo.BookingRepository;
import com.nangnaidee.backend.repo.LocationRepository;
import com.nangnaidee.backend.repo.LocationUnitRepository;
import com.nangnaidee.backend.repo.PaymentRepository;
import com.nangnaidee.backend.repo.UserRepository;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminTransactionService {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final LocationUnitRepository locationUnitRepository;
    private final LocationRepository locationRepository;

    private void ensureAdmin(String authorizationHeader) {
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

        boolean isAdmin = actor.getRoles().stream().map(Role::getCode).anyMatch("ADMIN"::equals);
        if (!isAdmin) throw new ForbiddenException("ต้องเป็น ADMIN เท่านั้น");
    }

    /**
     * List booking+payment combined for admin analysis.
     * Filtering is done in-memory to avoid changing repository interfaces.
     */
    public Map<String, Object> list(
            String authorizationHeader,
            String fromStr,
            String toStr,
            String status,
            String payStatus,
            Integer hostId,
            UUID locationId,
            int page,
            int size
    ) {
        ensureAdmin(authorizationHeader);

        LocalDateTime from = null;
        LocalDateTime to = null;
        try {
            if (fromStr != null && !fromStr.isBlank()) {
                // Parse YYYY-MM-DD format to LocalDateTime
                from = LocalDate.parse(fromStr, DateTimeFormatter.ofPattern("yyyy-MM-dd")).atStartOfDay();
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("รูปแบบวันที่ 'from' ไม่ถูกต้อง ใช้ yyyy-MM-dd");
        }
        try {
            if (toStr != null && !toStr.isBlank()) {
                // Parse YYYY-MM-DD format to LocalDateTime (end of day)
                to = LocalDate.parse(toStr, DateTimeFormatter.ofPattern("yyyy-MM-dd")).atTime(23, 59, 59);
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("รูปแบบวันที่ 'to' ไม่ถูกต้อง ใช้ yyyy-MM-dd");
        }
        
        // Validate date range
        if (from != null && to != null && from.isAfter(to)) {
            throw new IllegalArgumentException("วันที่เริ่มต้นต้องไม่เกินวันที่สิ้นสุด");
        }

        // Load bookings (sorted latest first)
        List<Booking> all = bookingRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));

        List<AdminTransactionResponseDto> mapped = new ArrayList<>();

        for (Booking b : all) {
            // filter by booking createdAt range
            if (from != null && b.getCreatedAt().isBefore(from)) continue;
            if (to != null && b.getCreatedAt().isAfter(to)) continue;

            // booking status filter
            if (status != null && !status.isBlank() && !status.equalsIgnoreCase(b.getStatus())) continue;

            // get payment (if any)
            Optional<Payment> payOpt = paymentRepository.findByBookingId(b.getId());
            if (payStatus != null && !payStatus.isBlank()) {
                String pstat = payOpt.map(Payment::getStatus).orElse(null);
                if (pstat == null || !payStatus.equalsIgnoreCase(pstat)) continue;
            }

            // location / host filters
            LocationUnit unit = locationUnitRepository.findById(b.getLocationUnitId()).orElse(null);
            if (unit == null) continue; // skip if unit missing

            if (locationId != null && !locationId.equals(unit.getLocationId())) continue;

            Location loc = locationRepository.findById(unit.getLocationId()).orElse(null);
            if (hostId != null) {
                if (loc == null || loc.getOwner() == null || !hostId.equals(loc.getOwner().getId())) continue;
            }

            UUID paymentId = payOpt.map(Payment::getId).orElse(null);
            String paymentStatus = payOpt.map(Payment::getStatus).orElse(null);
            BigDecimal amount = payOpt.map(Payment::getAmount).orElse(b.getTotal());
            Integer ownerId = (loc != null && loc.getOwner() != null) ? loc.getOwner().getId() : null;
            String locName = (loc != null) ? loc.getName() : null;

            AdminTransactionResponseDto dto = new AdminTransactionResponseDto(
                    b.getId(),
                    b.getStatus(),
                    paymentId,
                    paymentStatus,
                    amount,
                    ownerId,
                    locName,
                    b.getCreatedAt()
            );

            mapped.add(dto);
        }

        long total = mapped.size();
        int fromIdx = page * size;
        int toIdx = Math.min(fromIdx + size, mapped.size());
        List<AdminTransactionResponseDto> pageItems = Collections.emptyList();
        if (fromIdx < mapped.size()) pageItems = mapped.subList(fromIdx, toIdx);

        int totalPages = size > 0 ? (int) ((total + size - 1) / size) : 1;

        Map<String, Object> res = new HashMap<>();
        res.put("items", pageItems);
        res.put("page", page);
        res.put("size", size);
        res.put("total", total);
        res.put("totalPages", totalPages);
        return res;
    }
}
