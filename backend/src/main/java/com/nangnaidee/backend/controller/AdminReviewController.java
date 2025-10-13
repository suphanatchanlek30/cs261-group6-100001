// src/main/java/com/nangnaidee/backend/controller/AdminReviewController.java

package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.dto.ApiMessageResponse;
import com.nangnaidee.backend.dto.AdminReviewListResponse;
import com.nangnaidee.backend.service.AdminReviewService;
import com.nangnaidee.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * แยก controller สำหรับรีวิวของ ADMIN (list + delete)
 * - GET  /api/admin/reviews        (เพจ/ค้นหา/กรอง/เรียง)
 * - DELETE /api/admin/reviews/{id} (ใช้ ReviewService.deleteReview ที่คุณมีอยู่แล้วก็ได้)
 */
@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
public class AdminReviewController {

    private final AdminReviewService adminReviewService;
    private final ReviewService reviewService; // ใช้ของเดิมสำหรับลบ

    @GetMapping
    public ResponseEntity<AdminReviewListResponse> list(
            @RequestHeader("Authorization") String authorization,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "locationId", required = false) UUID locationId,
            @RequestParam(value = "minRating", required = false) Integer minRating,
            @RequestParam(value = "sortBy", defaultValue = "createdAt") String sortBy,  // createdAt|rating|user|location
            @RequestParam(value = "order", defaultValue = "desc") String order,         // asc|desc
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        var res = adminReviewService.list(authorization, q, locationId, minRating, page, size, sortBy, order);
        return ResponseEntity.ok(res);
    }
}
