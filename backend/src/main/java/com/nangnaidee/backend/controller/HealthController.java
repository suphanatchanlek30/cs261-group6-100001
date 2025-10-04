// src/main/java/com/nangnaidee/backend/controller/HealthController.java
package com.nangnaidee.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("OK");
    }

    @GetMapping("/info")
    public ResponseEntity<?> info() {
        return ResponseEntity.ok(
                java.util.Map.of(
                        "app", "nangnaidee-backend",
                        "status", "UP",
                        "ts", java.time.OffsetDateTime.now().toString()
                )
        );
    }
}
