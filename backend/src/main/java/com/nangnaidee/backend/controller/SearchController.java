package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.dto.AvailabilitySearchResponse;
import com.nangnaidee.backend.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {
    
    private final SearchService searchService;

    @GetMapping("/availability")
    public ResponseEntity<AvailabilitySearchResponse> searchAvailability(
            @RequestParam("start") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime start,
            @RequestParam("hours") Integer hours,
            @RequestParam(value = "q", required = false) String q,
            @RequestParam(value = "near", required = false) Double near,
            @RequestParam(value = "radiusKm", required = false) Double radiusKm,
            @RequestParam(value = "page", defaultValue = "0") Integer page,
            @RequestParam(value = "size", defaultValue = "10") Integer size) {

        AvailabilitySearchResponse response = searchService.searchAvailableUnits(
            start, hours, q, near, radiusKm, page, size);
        return ResponseEntity.ok(response);
    }
}