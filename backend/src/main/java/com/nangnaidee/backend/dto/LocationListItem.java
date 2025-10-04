// src/main/java/com/nangnaidee/backend/dto/LocationListItem.java
package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.UUID;

@Data
@AllArgsConstructor
public class LocationListItem {
    private UUID id;
    private String name;
    private String address;
    private Double geoLat;
    private Double geoLng;
    private String coverImageUrl;
    // ถ้าค้นหาแบบ near: จะใส่ distanceKm (ถ้าไม่ near จะเป็น null)
    private Double distanceKm;
}
