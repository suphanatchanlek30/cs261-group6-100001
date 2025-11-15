// src/main/java/com/nangnaidee/backend/service/ReviewService.java

package com.nangnaidee.backend.service;

import com.nangnaidee.backend.dto.*;
import com.nangnaidee.backend.exception.ConflictException;
import com.nangnaidee.backend.exception.ForbiddenException;
import com.nangnaidee.backend.exception.NotFoundException;
import com.nangnaidee.backend.exception.UnprocessableEntityException;
import com.nangnaidee.backend.model.Booking;
import com.nangnaidee.backend.model.Location;
import com.nangnaidee.backend.model.LocationUnit;
import com.nangnaidee.backend.model.Review;
import com.nangnaidee.backend.repo.BookingRepository;
import com.nangnaidee.backend.repo.LocationRepository;
import com.nangnaidee.backend.repo.LocationUnitRepository;
import com.nangnaidee.backend.repo.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final LocationUnitRepository locationUnitRepository;
    private final LocationRepository locationRepository;
    private final AuthService authService;

    public CreateReviewResponse createReview(String authorizationHeader, CreateReviewRequest request) {
        MeResponse me = authService.me(authorizationHeader);

        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new NotFoundException("ไม่พบการจอง"));

        // owner only
        if (!booking.getUserId().equals(me.getId())) {
            throw new ForbiddenException("คุณไม่มีสิทธิ์รีวิวการจองนี้");
        }

        // eligible: CONFIRMED (ถ้าจะรองรับ COMPLETED ให้เพิ่ม || "COMPLETED".equals(...))
        if (!"CONFIRMED".equals(booking.getStatus())) {
            throw new UnprocessableEntityException("สามารถรีวิวได้เฉพาะการจองที่ได้รับการยืนยันแล้วเท่านั้น");
        }

        // one review per booking
        if (reviewRepository.existsByBookingId(request.getBookingId())) {
            throw new ConflictException("มีรีวิวสำหรับการจองนี้แล้ว");
        }

        LocationUnit locationUnit = locationUnitRepository.findById(booking.getLocationUnitId())
                .orElseThrow(() -> new NotFoundException("ไม่พบข้อมูลยูนิต"));

        Review review = new Review();
        review.setId(UUID.randomUUID());
        review.setBookingId(request.getBookingId());
        review.setLocationId(locationUnit.getLocation().getId());
        review.setUserId(me.getId());
        review.setRating(request.getRating());
        review.setComment(request.getComment());
        review.setCreatedAt(LocalDateTime.now());

        reviewRepository.save(review);

        return new CreateReviewResponse(review.getId(), "รีวิวสำเร็จแล้ว");
    }

    public ReviewListResponse getLocationReviews(UUID locationId, Integer minRating, int page, int size) {
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new NotFoundException("ไม่พบสถานที่"));

        Pageable pageable = PageRequest.of(page, size);
        Page<Object[]> reviewPage = reviewRepository.findByLocationIdWithRatingFilter(locationId, minRating, pageable);

        List<ReviewListItem> items = reviewPage.getContent().stream()
                .map(row -> new ReviewListItem(
                        UUID.fromString((String) row[0]),
                        UUID.fromString((String) row[1]),
                        (Integer) row[2],
                        (String) row[3],
                        (Integer) row[4],
                        (String) row[5],
                        ((java.sql.Timestamp) row[6]).toLocalDateTime()
                ))
                .collect(Collectors.toList());

        return new ReviewListResponse(
                items,
                reviewPage.getNumber(),
                reviewPage.getSize(),
                reviewPage.getTotalElements(),
                reviewPage.getTotalPages()
        );
    }

    public void deleteReview(String authorizationHeader, UUID reviewId) {
        MeResponse me = authService.me(authorizationHeader);

        if (!me.getRoles().contains("ADMIN")) {
            throw new ForbiddenException("เฉพาะ ADMIN เท่านั้นที่สามารถลบรีวิวได้");
        }

        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NotFoundException("ไม่พบรีวิว"));

        reviewRepository.delete(review);
    }

    public LocationReviewsOverviewResponse getLocationReviewsOverview(
            java.util.UUID locationId, Integer minRating, int page, int size) {

        // 1) validate location มีจริง (ใช้ของเดิม)
        com.nangnaidee.backend.model.Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new com.nangnaidee.backend.exception.NotFoundException("ไม่พบสถานที่"));

        // 2) ดึงรายการรีวิวแบบเพจ (ใช้ query เดิม)
        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);
        org.springframework.data.domain.Page<Object[]> reviewPage =
                reviewRepository.findByLocationIdWithRatingFilter(locationId, minRating, pageable);

        java.util.List<ReviewListItem> items = reviewPage.getContent().stream()
                .map(row -> new ReviewListItem(
                        java.util.UUID.fromString((String) row[0]),       // id
                        java.util.UUID.fromString((String) row[1]),       // booking_id
                        (Integer) row[2],                                 // user_id
                        (String) row[3],                                  // user_first_name
                        (Integer) row[4],                                 // rating
                        (String) row[5],                                  // comment
                        ((java.sql.Timestamp) row[6]).toLocalDateTime()   // created_at
                ))
                .collect(java.util.stream.Collectors.toList());

        // 3) ดึงสถิติรวม
        java.util.List<Object[]> rows = reviewRepository.aggregateStatsByLocation(locationId, minRating);

        Double avgRating = null;
        long totalReviews = 0, reviewers = 0, r5 = 0, r4 = 0, r3 = 0, r2 = 0, r1 = 0;

        if (rows != null && !rows.isEmpty()) {
            Object[] statsRow = rows.get(0);
            if (statsRow != null && statsRow.length >= 8) {
                avgRating    = toDouble(statsRow[0]);
                totalReviews = toLong(statsRow[1]);
                reviewers    = toLong(statsRow[2]);
                r5 = toLong(statsRow[3]);
                r4 = toLong(statsRow[4]);
                r3 = toLong(statsRow[5]);
                r2 = toLong(statsRow[6]);
                r1 = toLong(statsRow[7]);
            }
        }

        RatingStats stats = new RatingStats(avgRating, totalReviews, reviewers, r5, r4, r3, r2, r1);

        return new LocationReviewsOverviewResponse(
                items,
                reviewPage.getNumber(),
                reviewPage.getSize(),
                reviewPage.getTotalElements(),
                reviewPage.getTotalPages(),
                stats
        );
    }

    // helpers แปลงชนิดให้ปลอดภัย
    private static Double toDouble(Object o) {
        if (o == null) return null;
        if (o instanceof java.math.BigDecimal bd) return bd.doubleValue();
        if (o instanceof Number n) return n.doubleValue();
        return Double.valueOf(o.toString());
    }
    private static long toLong(Object o) {
        if (o == null) return 0L;
        if (o instanceof java.math.BigDecimal bd) return bd.longValue();
        if (o instanceof Number n) return n.longValue();
        return Long.parseLong(o.toString());
    }
}
