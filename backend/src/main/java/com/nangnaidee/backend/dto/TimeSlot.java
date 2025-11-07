// backend/src/main/java/com/nangnaidee/backend/dto/TimeSlot.java

package com.nangnaidee.backend.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TimeSlot {
    
    @NotBlank(message = "start time ต้องไม่ว่าง")
    @Pattern(regexp = "^([0-1][0-9]|2[0-3]):[0-5][0-9]$", message = "start time ต้องอยู่ในรูปแบบ HH:MM (เช่น 09:00)")
    private String start;
    
    @NotBlank(message = "end time ต้องไม่ว่าง")
    @Pattern(regexp = "^([0-1][0-9]|2[0-3]):[0-5][0-9]$", message = "end time ต้องอยู่ในรูปแบบ HH:MM (เช่น 18:00)")
    private String end;
}
//โค้ดตัวนี้มีไว้สําหรับการ กำหนดช่วงเวลาที่มีการตรวจสอบความถูกต้องของข้อมูล โดยมีฟิลด์ start และ end ที่ต้องไม่ว่างและต้องอยู่ในรูปแบบ HH:MM