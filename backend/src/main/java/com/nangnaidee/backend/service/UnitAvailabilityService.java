// src/main/java/com/nangnaidee/backend/service/UnitAvailabilityService.java

package com.nangnaidee.backend.service;

import com.nangnaidee.backend.dto.OccupiedSlotsResponse;
import com.nangnaidee.backend.exception.BadRequestException;
import com.nangnaidee.backend.exception.NotFoundException;
import com.nangnaidee.backend.model.LocationUnit;
import com.nangnaidee.backend.model.Booking;
import com.nangnaidee.backend.repo.BookingRepository;
import com.nangnaidee.backend.repo.LocationUnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class UnitAvailabilityService {

    private final LocationUnitRepository locationUnitRepository;
    private final BookingRepository bookingRepository;

    private static final ZoneId BKK = ZoneId.of("Asia/Bangkok");
    private static final int MAX_RANGE_DAYS = 31;

    @Transactional(readOnly = true)
    public OccupiedSlotsResponse getOccupied(UUID unitId, OffsetDateTime from, OffsetDateTime to) {
        LocationUnit unit = locationUnitRepository.findById(unitId)
                .orElseThrow(() -> new NotFoundException("ไม่พบยูนิต"));

        if (from == null || to == null) {
            throw new BadRequestException("ต้องระบุ from และ to (ISO-8601)");
        }
        if (!from.isBefore(to)) {
            throw new BadRequestException("from ต้องน้อยกว่า to");
        }
        long days = Duration.between(from, to).toDays();
        if (days > MAX_RANGE_DAYS) {
            throw new BadRequestException("ช่วงเวลาค้นหายาวเกินไป (ไม่เกิน " + MAX_RANGE_DAYS + " วัน)");
        }

        // แปลงเป็น LDT สำหรับคิวรี DB
        LocalDateTime fromLdt = from.toLocalDateTime();
        LocalDateTime toLdt   = to.toLocalDateTime();

        List<Booking> overlapped = bookingRepository.findActiveOverlapsByUnitId(unit.getId(), fromLdt, toLdt);

        var slots = overlapped.stream().map(b -> {
            // สมมติใน entity Booking เก็บ startTime/endTime เป็น LocalDateTime
            OffsetDateTime start = b.getStartTime().atZone(BKK).toOffsetDateTime();
            OffsetDateTime end   = b.getEndTime().atZone(BKK).toOffsetDateTime();
            return new OccupiedSlotsResponse.Slot(start.toString(), end.toString(), b.getStatus());
        }).toList();

        return new OccupiedSlotsResponse(
                unit.getId(),
                from.atZoneSameInstant(BKK).toOffsetDateTime().toString(),
                to.atZoneSameInstant(BKK).toOffsetDateTime().toString(),
                slots
        );
    }
}
