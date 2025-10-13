// src/main/java/com/nangnaidee/backend/service/AdminReviewService.java

package com.nangnaidee.backend.service;

import com.nangnaidee.backend.config.JwtTokenProvider;
import com.nangnaidee.backend.dto.AdminReviewListItem;
import com.nangnaidee.backend.dto.AdminReviewListResponse;
import com.nangnaidee.backend.exception.ForbiddenException;
import com.nangnaidee.backend.exception.UnauthorizedException;
import com.nangnaidee.backend.model.Role;
import com.nangnaidee.backend.model.User;
import com.nangnaidee.backend.repo.ReviewRepository;
import com.nangnaidee.backend.repo.UserRepository;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminReviewService {

    private final JwtTokenProvider jwtTokenProvider;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;

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

    public AdminReviewListResponse list(
            String authorizationHeader,
            String q,
            UUID locationId,
            Integer minRating,
            int page,
            int size,
            String sortBy,   // createdAt|rating|user|location
            String order     // asc|desc
    ) {
        ensureAdmin(authorizationHeader);

        // สร้าง sort เริ่มต้น (ล่าสุดก่อน)
        Sort sort = Sort.by(Sort.Direction.DESC, "created_at");
        if (sortBy != null) {
            String col = switch (sortBy) {
                case "rating"   -> "rating";
                case "user"     -> "user_name";
                case "location" -> "location_name";
                default         -> "created_at";
            };
            Sort.Direction dir = "asc".equalsIgnoreCase(order) ? Sort.Direction.ASC : Sort.Direction.DESC;
            sort = Sort.by(dir, col);
        }

        Pageable pageable = PageRequest.of(page, size, sort);

        // คีย์เวิร์ดค้นหา: lower-case ก่อนส่งให้ query
        String qUse = (q == null || q.isBlank()) ? null : q.trim();

        Page<Object[]> pageRows = reviewRepository.adminSearchReviews(qUse, locationId, minRating, pageable);

        List<AdminReviewListItem> items = pageRows.getContent().stream()
                .map(r -> {
                    // mapping indices ตาม SELECT
                    UUID reviewId = toUuid(r[0]);
                    UUID bookingId = toUuid(r[1]);
                    Integer userId = toInt(r[2]);
                    String userName = (String) r[3];
                    Integer rating = toInt(r[4]);
                    String comment = (String) r[5];
                    LocalDateTime createdAt = toLdt(r[6]);
                    UUID locId = toUuid(r[7]);
                    String locName = (String) r[8];
                    String cover = (String) r[9];

                    return new AdminReviewListItem(
                            reviewId, bookingId,
                            userId, userName,
                            rating, comment, createdAt,
                            locId, locName, cover
                    );
                })
                .collect(Collectors.toList());

        return new AdminReviewListResponse(
                items,
                pageRows.getNumber(),
                pageRows.getSize(),
                pageRows.getTotalElements(),
                pageRows.getTotalPages()
        );
    }

    /* ---------- helpers ---------- */

    private static UUID toUuid(Object o) {
        if (o == null) return null;
        if (o instanceof UUID u) return u;
        return UUID.fromString(o.toString());
    }

    private static Integer toInt(Object o) {
        if (o == null) return null;
        if (o instanceof Number n) return n.intValue();
        return Integer.valueOf(o.toString());
    }

    private static LocalDateTime toLdt(Object o) {
        if (o == null) return null;
        if (o instanceof Timestamp ts) return ts.toLocalDateTime();
        // เผื่อกรณี Hibernate/driver ให้เป็น LocalDateTime มาอยู่แล้ว
        if (o instanceof LocalDateTime ldt) return ldt;
        return LocalDateTime.parse(o.toString());
    }
}
