// backend/src/main/java/com/nangnaidee/backend/dto/SetLocationHoursRequest.java

package com.nangnaidee.backend.dto;

import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SetLocationHoursRequest {
    
    @Valid
    private List<TimeSlot> mon;
    
    @Valid
    private List<TimeSlot> tue;
    
    @Valid
    private List<TimeSlot> wed;
    
    @Valid
    private List<TimeSlot> thu;
    
    @Valid
    private List<TimeSlot> fri;
    
    @Valid
    private List<TimeSlot> sat;
    
    @Valid
    private List<TimeSlot> sun;
    
    public Map<String, List<TimeSlot>> getAllDays() {
        return Map.of(
                "mon", mon != null ? mon : List.of(),
                "tue", tue != null ? tue : List.of(),
                "wed", wed != null ? wed : List.of(),
                "thu", thu != null ? thu : List.of(),
                "fri", fri != null ? fri : List.of(),
                "sat", sat != null ? sat : List.of(),
                "sun", sun != null ? sun : List.of()
        );
    }
}
//โค้ดตัวนี้มีไว้สําหรับการ รับข้อมูลการตั้งค่าชั่วโมงการทํางานของสถานที่ โดยมีฟิลด์สำหรับแต่ละวันในสัปดาห์ที่เก็บรายการช่วงเวลา (TimeSlot) ที่เปิดให้บริการ