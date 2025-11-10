package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.dto.PatchUserStatusRequest;
import com.nangnaidee.backend.dto.PatchUserStatusResponse;
import com.nangnaidee.backend.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
public class AdminUserController {

    private final AdminService adminService;

    @PatchMapping("/{id}/status")
    public ResponseEntity<PatchUserStatusResponse> updateUserStatus(
            @RequestHeader("Authorization") String authorizationHeader,
            @PathVariable Integer id,
            @RequestBody PatchUserStatusRequest request
    ) {
        PatchUserStatusResponse response = adminService.updateUserStatus(authorizationHeader, id, request);
        return ResponseEntity.ok(response);
    }
}