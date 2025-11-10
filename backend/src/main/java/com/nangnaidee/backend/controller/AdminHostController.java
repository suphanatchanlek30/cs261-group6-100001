package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.dto.LocationListItem;
import com.nangnaidee.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/hosts")
@RequiredArgsConstructor
public class AdminHostController {

    private final AdminService adminService;

    @GetMapping("/{hostId}/locations")
    public ResponseEntity<List<LocationListItem>> getHostLocations(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Integer hostId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        List<LocationListItem> items = adminService.getHostLocations(authorizationHeader, hostId, page, size);
        return ResponseEntity.ok(items);
    }
}
