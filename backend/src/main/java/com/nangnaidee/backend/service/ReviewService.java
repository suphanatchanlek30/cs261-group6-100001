// src/main/java/com/nangnaidee/backend/service/ReviewService.java

package com.nangnaidee.backend.service;

import com.nangnaidee.backend.dto.CreateReviewRequest;
import com.nangnaidee.backend.dto.CreateReviewResponse;
import com.nangnaidee.backend.dto.MeResponse;
import com.nangnaidee.backend.dto.ReviewListItem;
import com.nangnaidee.backend.dto.ReviewListResponse;
import com.nangnaidee.backend.exception.ConflictException;
import com.nangnaidee.backend.exception.ForbiddenException;
import com.nangnaidee.backend.exception.NotFoundException;
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
        
        // Check if booking exists
        Booking booking = bookingRepository.findById(request.getBookingId())
                .orElseThrow(() -> new NotFoundException("ไม่พบการจอง"));
        
        // Check if user is the owner of the booking
        if (!booking.getUserId().equals(me.getId())) {
            throw new ForbiddenException("คุณไม่มีสิทธิ์รีวิวการจองนี้");
        }
        
        // Check if booking is eligible for review (should be CONFIRMED or completed)
        if (!"CONFIRMED".equals(booking.getStatus())) {
            throw new IllegalArgumentException("สามารถรีวิวได้เฉพาะการจองที่ได้รับการยืนยันแล้วเท่านั้น");
        }
        
        // Check if review already exists for this booking
        if (reviewRepository.existsByBookingId(request.getBookingId())) {
            throw new ConflictException("มีรีวิวสำหรับการจองนี้แล้ว");
        }
        
        // Get location unit to find location_id
        LocationUnit locationUnit = locationUnitRepository.findById(booking.getLocationUnitId())
                .orElseThrow(() -> new NotFoundException("ไม่พบข้อมูลยูนิต"));
        
        // Create new review
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
        // Check if location exists
        Location location = locationRepository.findById(locationId)
                .orElseThrow(() -> new NotFoundException("ไม่พบสถานที่"));
        
        Pageable pageable = PageRequest.of(page, size);
        Page<Object[]> reviewPage = reviewRepository.findByLocationIdWithRatingFilter(locationId, minRating, pageable);
        
        List<ReviewListItem> items = reviewPage.getContent().stream()
                .map(row -> new ReviewListItem(
                        UUID.fromString((String) row[0]),    // id - convert String to UUID
                        UUID.fromString((String) row[1]),    // booking_id - convert String to UUID
                        (Integer) row[2],                     // user_id
                        (String) row[3],                      // user_first_name
                        (Integer) row[4],                     // rating
                        (String) row[5],                      // comment
                        ((java.sql.Timestamp) row[6]).toLocalDateTime() // created_at
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
        
        // Check if user is ADMIN
        if (!me.getRoles().contains("ADMIN")) {
            throw new ForbiddenException("เฉพาะ ADMIN เท่านั้นที่สามารถลบรีวิวได้");
        }
        
        // Check if review exists
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new NotFoundException("ไม่พบรีวิว"));
        
        // Delete the review
        reviewRepository.delete(review);
    }
}