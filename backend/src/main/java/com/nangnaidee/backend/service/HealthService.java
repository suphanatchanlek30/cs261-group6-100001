package com.nangnaidee.backend.service;

import org.springframework.stereotype.Service;

@Service
public class HealthService {
    public String getStatus() { return "UP"; }
}
