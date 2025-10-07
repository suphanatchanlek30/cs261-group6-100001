// src/main/java/com/nangnaidee/backend/service/SearchService.java

package com.nangnaidee.backend.service;

import com.nangnaidee.backend.dto.AvailabilitySearchResponse;
import com.nangnaidee.backend.dto.AvailableUnitItem;
import com.nangnaidee.backend.repo.LocationUnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {

    private final LocationUnitRepository locationUnitRepository;

    public AvailabilitySearchResponse searchAvailableUnits(
            LocalDateTime start, 
            Integer hours, 
            String q, 
            Double near, 
            Double radiusKm, 
            Integer page, 
            Integer size) {
        
        // Validate start time (must be on the hour)
        if (start.getMinute() != 0 || start.getSecond() != 0 || start.getNano() != 0) {
            throw new IllegalArgumentException("เวลาเริ่มต้นต้องเป็นจุดเต็มชั่วโมง เช่น 13:00:00");
        }

        // Validate hours
        if (hours == null || hours < 1) {
            throw new IllegalArgumentException("จำนวนชั่วโมงต้องอย่างน้อย 1 ชั่วโมง");
        }

        // Calculate end time
        LocalDateTime endTime = start.plusHours(hours);

        // Prepare search parameters
        String searchQuery = q != null && !q.trim().isEmpty() 
            ? "%" + q.trim() + "%" : null;
        
        // For location search, we need both lat and lng
        Double searchLat = null;
        Double searchLng = null;
        if (near != null) {
            // สำหรับตัวอย่างนี้ ใช้ near เป็น latitude และถือว่า longitude เป็น 100.5 (กรุงเทพฯ)
            // ในการใช้งานจริงควรส่ง nearLat และ nearLng แยกกัน
            searchLat = near;
            searchLng = 100.5; // Default longitude for Bangkok
        }
        
        // Set default values
        if (page == null) page = 0;
        if (size == null) size = 10;
        
        Pageable pageable = PageRequest.of(page, size);

        // Execute search
        Page<Object[]> results = locationUnitRepository.findAvailableUnits(
                start,
                endTime,
                searchQuery,
                searchLat,
                searchLng,
                radiusKm,
                pageable
        );

        // Convert results to DTOs
        List<AvailableUnitItem> items = results.getContent().stream()
                .map(this::mapToAvailableUnitItem)
                .collect(Collectors.toList());

        return new AvailabilitySearchResponse(
                items,
                results.getNumber(),
                results.getSize(),
                results.getTotalElements()
        );
    }

    private AvailableUnitItem mapToAvailableUnitItem(Object[] row) {
        return new AvailableUnitItem(
                UUID.fromString((String) row[0]),  // unit_id
                (String) row[1],                   // unit_code
                (String) row[2],                   // unit_name
                (String) row[3],                   // unit_image_url
                (String) row[4],                   // unit_short_desc
                (Integer) row[5],                  // capacity
                (BigDecimal) row[6],               // price_hourly
                UUID.fromString((String) row[7]),  // location_id
                (String) row[8],                   // location_name
                (String) row[9],                   // address_text
                (Double) row[10],                  // geo_lat
                (Double) row[11],                  // geo_lng
                (String) row[12],                  // cover_image_url
                (Double) row[13]                   // distance_km
        );
    }
}