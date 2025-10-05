package com.nangnaidee.backend.service;

import com.nangnaidee.backend.dto.CreateReviewRequest;
import com.nangnaidee.backend.dto.CreateReviewResponse;
import com.nangnaidee.backend.dto.MeResponse;
import com.nangnaidee.backend.exception.ConflictException;
import com.nangnaidee.backend.exception.ForbiddenException;
import com.nangnaidee.backend.exception.NotFoundException;
import com.nangnaidee.backend.model.Booking;
import com.nangnaidee.backend.model.LocationUnit;
import com.nangnaidee.backend.model.Review;
import com.nangnaidee.backend.repo.BookingRepository;
import com.nangnaidee.backend.repo.LocationUnitRepository;
import com.nangnaidee.backend.repo.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ReviewService {
    
    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final LocationUnitRepository locationUnitRepository;
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
        
        return new CreateReviewResponse(review.getId());
    }
}