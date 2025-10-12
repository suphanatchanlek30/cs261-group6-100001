// src/main/java/com/nangnaidee/backend/controller/ReviewController.java

package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.dto.ApiMessageResponse;
import com.nangnaidee.backend.dto.CreateReviewRequest;
import com.nangnaidee.backend.dto.CreateReviewResponse;
import com.nangnaidee.backend.dto.ReviewListResponse;
import com.nangnaidee.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.UUID;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {
    
    private final ReviewService reviewService;
    
    @PostMapping("/reviews")
    public ResponseEntity<CreateReviewResponse> createReview(
            @RequestHeader("Authorization") String authorization,
            @Valid @RequestBody CreateReviewRequest request) {
        CreateReviewResponse response = reviewService.createReview(authorization, request);
        return ResponseEntity.created(URI.create("/api/reviews/" + response.getId())).body(response);
    }
    
    @GetMapping("/locations/{locationId}/reviews")
    public ResponseEntity<ReviewListResponse> getLocationReviews(
            @PathVariable("locationId") UUID locationId,
            @RequestParam(value = "minRating", required = false) Integer minRating,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {
        ReviewListResponse response = reviewService.getLocationReviews(locationId, minRating, page, size);
        return ResponseEntity.ok(response);
    }
    
    @DeleteMapping("/admin/reviews/{id}")
    public ResponseEntity<ApiMessageResponse> deleteReview(
            @RequestHeader("Authorization") String authorization,
            @PathVariable("id") UUID id) {
        reviewService.deleteReview(authorization, id);
        return ResponseEntity.ok(new ApiMessageResponse("ลบรีวิวสำเร็จ"));
    }

    @GetMapping("/locations/{locationId}/reviews/overview")
    public ResponseEntity<com.nangnaidee.backend.dto.LocationReviewsOverviewResponse> getLocationReviewsOverview(
            @PathVariable("locationId") java.util.UUID locationId,
            @RequestParam(value = "minRating", required = false) Integer minRating,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size) {

        var res = reviewService.getLocationReviewsOverview(locationId, minRating, page, size);
        return ResponseEntity.ok(res);
    }

}