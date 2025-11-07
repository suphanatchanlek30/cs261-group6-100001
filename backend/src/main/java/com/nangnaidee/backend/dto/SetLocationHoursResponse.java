// backend/src/main/java/com/nangnaidee/backend/dto/SetLocationHoursResponse.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SetLocationHoursResponse {
    
    private String message;
    private Map<String, List<TimeSlot>> hours;
    
    public SetLocationHoursResponse(String message) {
        this.message = message;
    }
}
//โค้ดตัวนี้มีไว้สําหรับการ ตอบกลับหลังจากการตั้งค่าชั่วโมงการทำงานของสถานที่ โดยมีฟิลด์ message สำหรับข้อความยืนยัน และ hours สำหรับเก็บชั่วโมงการทำงานในรูปแบบแผนที่ของวันในสัปดาห์และรายการช่วงเวลา