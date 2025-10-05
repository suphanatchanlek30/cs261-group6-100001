package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.dto.CreateReviewRequest;
import com.nangnaidee.backend.dto.CreateReviewResponse;
import com.nangnaidee.backend.service.ReviewService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;

@RestController
@RequestMapping("/api/reviews")
@RequiredArgsConstructor
public class ReviewController {
    
    private final ReviewService reviewService;
    
    @PostMapping
    public ResponseEntity<CreateReviewResponse> createReview(
            @RequestHeader("Authorization") String authorization,
            @Valid @RequestBody CreateReviewRequest request) {
        CreateReviewResponse response = reviewService.createReview(authorization, request);
        return ResponseEntity.created(URI.create("/api/reviews/" + response.getId())).body(response);
    }
}