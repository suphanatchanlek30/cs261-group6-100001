// src/main/java/com/nangnaidee/backend/repo/LocationRepositoryCustom.java

package com.nangnaidee.backend.repo;

import com.nangnaidee.backend.dto.LocationListItem;

import java.util.List;

public interface LocationRepositoryCustom {
    List<LocationListItem> searchNear(String q, double lat, double lng, double radiusKm, int offset, int size);
    long countNear(String q, double lat, double lng, double radiusKm);
}