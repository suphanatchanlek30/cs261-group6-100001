// src/main/java/com/nangnaidee/backend/repo/LocationRepository.java

package com.nangnaidee.backend.repo;

import com.nangnaidee.backend.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface LocationRepository extends JpaRepository<Location, UUID> {
}
