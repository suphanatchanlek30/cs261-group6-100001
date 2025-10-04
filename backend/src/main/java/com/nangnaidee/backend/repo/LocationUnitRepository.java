// src/main/java/com/nangnaidee/backend/repo/LocationUnitRepository.java
package com.nangnaidee.backend.repo;

import com.nangnaidee.backend.model.LocationUnit;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LocationUnitRepository extends JpaRepository<LocationUnit, UUID> {
    List<LocationUnit> findByLocation_IdOrderByCodeAsc(UUID locationId);
}
