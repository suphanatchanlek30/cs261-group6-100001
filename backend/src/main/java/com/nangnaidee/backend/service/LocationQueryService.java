// src/main/java/com/nangnaidee/backend/service/LocationQueryService.java

package com.nangnaidee.backend.service;

import com.nangnaidee.backend.dto.LocationListItem;
import com.nangnaidee.backend.dto.LocationListResponse;
import com.nangnaidee.backend.exception.BadRequestException;
import com.nangnaidee.backend.model.Location;
import com.nangnaidee.backend.repo.LocationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class LocationQueryService {

    private final LocationRepository locationRepository;

    public LocationListResponse search(String q, String near, Double radiusKm, Integer page, Integer size) {
        int p = (page == null || page < 0) ? 0 : page;
        int s = (size == null || size <= 0) ? 10 : Math.min(size, 100);

        // near mode
        if (near != null && !near.isBlank()) {
            var coords = parseNear(near);
            double lat = coords[0];
            double lng = coords[1];

            if (radiusKm == null || radiusKm <= 0) {
                throw new BadRequestException("กรุณาระบุ radiusKm (>0) เมื่อใช้ near");
            }

            int offset = p * s;
            List<LocationListItem> items = locationRepository.searchNear(q, lat, lng, radiusKm, offset, s);
            long total = locationRepository.countNear(q, lat, lng, radiusKm);

            return new LocationListResponse(items, p, s, total);
        }

        // q-only (หรือไม่มี filterเลย): ใช้ Page JPA ปกติ, sort ใหม่สุดก่อน
        Pageable pageable = PageRequest.of(p, s, Sort.by(Sort.Direction.DESC, "createdAt"));
        String query = (q == null) ? "" : q.trim();
        Page<Location> pageData = locationRepository
                .findByNameContainingIgnoreCaseOrAddressTextContainingIgnoreCase(query, query, pageable);

        List<LocationListItem> items = pageData.getContent().stream()
                .map(l -> new LocationListItem(
                        l.getId(), l.getName(), l.getAddressText(), l.getGeoLat(), l.getGeoLng(), l.getCoverImageUrl(), null
                )).toList();

        return new LocationListResponse(items, p, s, pageData.getTotalElements());
    }

    // รูปแบบที่ยอมรับ: "lat,lng" (รองรับช่องว่างเล็กน้อย)
    private double[] parseNear(String near) {
        String s = near.trim().toLowerCase(Locale.ROOT);
        String[] parts = s.split(",");
        if (parts.length != 2) throw new BadRequestException("รูปแบบ near ต้องเป็น 'lat,lng'");
        try {
            double lat = Double.parseDouble(parts[0].trim());
            double lng = Double.parseDouble(parts[1].trim());
            if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
                throw new BadRequestException("ค่าพิกัดต้องอยู่ในช่วง lat[-90,90], lng[-180,180]");
            }
            return new double[]{lat, lng};
        } catch (NumberFormatException ex) {
            throw new BadRequestException("รูปแบบ near ต้องเป็นตัวเลข เช่น '18.79,98.98'");
        }
    }
}
