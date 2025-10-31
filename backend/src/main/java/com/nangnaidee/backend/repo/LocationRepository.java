// src/main/java/com/nangnaidee/backend/repo/LocationRepository.java

package com.nangnaidee.backend.repo;

import com.nangnaidee.backend.model.Location;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LocationRepository extends JpaRepository<Location, UUID>, LocationRepositoryCustom {

    // สำหรับโหมด q-only (ไม่ near): ค้นหาชื่อหรือที่อยู่
    Page<Location> findByNameContainingIgnoreCaseOrAddressTextContainingIgnoreCase(
            String name, String address, Pageable pageable
    );

    /**
     * ค้นหาสถานที่ทั้งหมดของ Host (ownerId) โดยเรียงตามวันที่สร้างล่าสุด
     */
    List<Location> findByOwnerIdOrderByCreatedAtDesc(Integer ownerId);

    /**
     * ค้นหาสถานที่ของ Host (ownerId) โดยกรองตามสถานะ (isActive)
     */
    List<Location> findByOwnerIdAndIsActiveOrderByCreatedAtDesc(Integer ownerId, boolean isActive);


}