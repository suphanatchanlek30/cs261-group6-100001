// backend/src/main/java/com/nangnaidee/backend/repo/UnitBlockRepository.java

package com.nangnaidee.backend.repo;

import com.nangnaidee.backend.model.UnitBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface UnitBlockRepository extends JpaRepository<UnitBlock, UUID> {
    
    List<UnitBlock> findByUnitIdOrderByStartTimeAsc(UUID unitId);
    
    @Query("SELECT ub FROM UnitBlock ub WHERE ub.unit.id = :unitId " +
           "AND ub.startTime < :endTime AND ub.endTime > :startTime")
    List<UnitBlock> findOverlappingBlocks(
            @Param("unitId") UUID unitId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime
    );
}