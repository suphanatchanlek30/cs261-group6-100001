// src/main/java/com/nangnaidee/backend/dto/RatingStats.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @AllArgsConstructor @NoArgsConstructor
public class RatingStats {
    private Double avgRating;   // ค่าเฉลี่ย (null ได้ถ้ายังไม่มีรีวิว)
    private long totalReviews;  // จำนวนรีวิวทั้งหมด (หลังกรอง minRating ถ้ามี)
    private long reviewers;     // จำนวนผู้รีวิว (distinct user)

    // แจกแจงรายดาว (ไว้ทำ histogram)
    private long r5;
    private long r4;
    private long r3;
    private long r2;
    private long r1;
}
