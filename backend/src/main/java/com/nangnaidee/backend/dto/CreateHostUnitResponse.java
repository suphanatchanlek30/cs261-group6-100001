// backend/src/main/java/com/nangnaidee/backend/dto/CreateHostUnitResponse.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateHostUnitResponse {
    private UUID id;
    private String publishStatus;
}

//โค้ดตัวนี้มีไว้สําหรับการ ตอบกลับซึ่งตอบกลับ 2 ตัวคือ id ของ unit และ publishStatus ว่า INHERIT หรือไม่