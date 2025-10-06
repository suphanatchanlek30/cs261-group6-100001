// src/main/java/com/nangnaidee/backend/service/HealthService.java

package com.nangnaidee.backend.service;

import org.springframework.stereotype.Service;

@Service
public class HealthService {
    public String getStatus() { return "UP"; }
}
