// src/main/java/com/nangnaidee/backend/dto/OccupiedSlotsResponse.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;
import java.util.UUID;

@Data
@AllArgsConstructor
public class OccupiedSlotsResponse {
    private UUID unitId;
    private String from; // ISO-8601 (+07:00)
    private String to;   // ISO-8601 (+07:00)
    private List<Slot> slots;

    @Data
    @AllArgsConstructor
    public static class Slot {
        private String start;  // ISO-8601 (+07:00)
        private String end;    // ISO-8601 (+07:00)
        private String status; // HOLD | PENDING_REVIEW | CONFIRMED
    }
}
