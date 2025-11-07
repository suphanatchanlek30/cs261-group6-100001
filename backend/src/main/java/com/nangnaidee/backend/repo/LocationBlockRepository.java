// backend/src/main/java/com/nangnaidee/backend/repo/LocationBlockRepository.java

package com.nangnaidee.backend.repo;

import com.nangnaidee.backend.model.LocationBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface LocationBlockRepository extends JpaRepository<LocationBlock, UUID> {
    
    List<LocationBlock> findByLocationIdOrderByStartTimeAsc(UUID locationId);
    
    @Query("SELECT lb FROM LocationBlock lb WHERE lb.location.id = :locationId " +
           "AND lb.startTime < :endTime AND lb.endTime > :startTime")
    List<LocationBlock> findOverlappingBlocks(
            @Param("locationId") UUID locationId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );
    //โค้ดตัวนี้มีไว้สําหรับการ จัดการข้อมูลบล็อกของสถานที่ในฐานข้อมูล โดยมีฟังก์ชันในการค้นหาและตรวจสอบช่วงเวลาที่ทับซ้อนกันตาม locationId
}