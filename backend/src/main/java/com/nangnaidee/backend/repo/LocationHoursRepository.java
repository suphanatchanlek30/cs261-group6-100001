// backend/src/main/java/com/nangnaidee/backend/repo/LocationHoursRepository.java

package com.nangnaidee.backend.repo;

import com.nangnaidee.backend.model.LocationHours;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface LocationHoursRepository extends JpaRepository<LocationHours, UUID> {
    
    List<LocationHours> findByLocationIdOrderByDayOfWeekAscStartTimeAsc(UUID locationId);
    
    void deleteByLocationId(UUID locationId);
}
//โค้ดตัวนี้มีไว้สําหรับการ จัดการข้อมูลชั่วโมงการทํางานของสถานที่ในฐานข้อมูล โดยมีฟังก์ชันในการค้นหาและลบข้อมูลตาม locationId