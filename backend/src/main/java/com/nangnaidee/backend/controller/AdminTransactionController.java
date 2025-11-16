package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.service.AdminTransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/transactions")
@RequiredArgsConstructor
public class AdminTransactionController {

    private final AdminTransactionService adminTransactionService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> list(
            @RequestHeader("Authorization") String authorization,
            @RequestParam(value = "from", required = false) String from,
            @RequestParam(value = "to", required = false) String to,
            @RequestParam(value = "status", required = false) String status,
            @RequestParam(value = "payStatus", required = false) String payStatus,
            @RequestParam(value = "hostId", required = false) Integer hostId,
            @RequestParam(value = "locationId", required = false) UUID locationId,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        Map<String, Object> res = adminTransactionService.list(
                authorization, from, to, status, payStatus, hostId, locationId, page, size
        );
        return ResponseEntity.ok(res);
    }
}
