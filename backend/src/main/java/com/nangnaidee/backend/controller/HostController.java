// backend/src/main/java/com/nangnaidee/backend/controller/HostController.java

package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.dto.MeResponse;
import com.nangnaidee.backend.service.HostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/hosts")
@RequiredArgsConstructor
public class HostController {

    private final HostService hostService;

    /**
     * ดึงโปรไฟล์ของ Host ที่ล็อกอินอยู่ (สำหรับ Onboarding)
     */
    @GetMapping("/me")
    public ResponseEntity<MeResponse> getHostProfile(
            @RequestHeader(value = "Authorization", required = false) String authorization
    ) {
        MeResponse response = hostService.getHostProfile(authorization);
        return ResponseEntity.ok(response);
    }
}