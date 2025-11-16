// src/main/java/com/nangnaidee/backend/repo/LocationRepository.java

package com.nangnaidee.backend.repo;

import com.nangnaidee.backend.model.Location;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LocationRepository extends JpaRepository<Location, UUID>, LocationRepositoryCustom {

    // For q-only mode (not near): search by name or address (active locations only)
    Page<Location> findByNameContainingIgnoreCaseOrAddressTextContainingIgnoreCaseAndIsActiveTrue(
            String name, String address, Pageable pageable
    );

    /**
     * Find all locations of a Host (ownerId) ordered by creation date (newest first)
     */
    List<Location> findByOwnerIdOrderByCreatedAtDesc(Integer ownerId);

    /**
     * Find locations of a Host (ownerId) filtered by status (isActive)
     */
    List<Location> findByOwnerIdAndIsActiveOrderByCreatedAtDesc(Integer ownerId, boolean isActive);

    /**
     * Find locations owned by a specific user (host) with pagination
     */
    Page<Location> findByOwner_Id(Integer ownerId, Pageable pageable);

    /**
     * Admin Review Queue - find locations that are PENDING_REVIEW (isActive = false + rejectReason = "__PENDING__")
     */
    Page<Location> findByIsActiveFalseAndRejectReason(String rejectReason, Pageable pageable);
    
    Page<Location> findByOwnerIdAndIsActiveFalseAndRejectReason(Integer ownerId, String rejectReason, Pageable pageable);
    
    Page<Location> findByNameContainingIgnoreCaseAndIsActiveFalseAndRejectReason(String name, String rejectReason, Pageable pageable);
    
    Page<Location> findByOwnerIdAndNameContainingIgnoreCaseAndIsActiveFalseAndRejectReason(Integer ownerId, String name, String rejectReason, Pageable pageable);

}