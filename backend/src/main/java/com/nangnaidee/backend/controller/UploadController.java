// src/main/java/com/nangnaidee/backend/controller/UploadController.java

package com.nangnaidee.backend.controller;

import com.nangnaidee.backend.config.JwtTokenProvider;
import com.nangnaidee.backend.dto.UploadImageResponse;
import com.nangnaidee.backend.exception.UnauthorizedException;
import com.nangnaidee.backend.service.CloudinaryService;
import io.jsonwebtoken.JwtException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/uploads")
@RequiredArgsConstructor
public class UploadController {

    private final CloudinaryService cloudinaryService;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping(path = "/images", consumes = "multipart/form-data")
    public ResponseEntity<UploadImageResponse> uploadImage(
            @RequestHeader(value = "Authorization", required = false) String authorization,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "folder", defaultValue = "nangnaidee/locations") String folder
    ) throws Exception {
        if (authorization == null || !authorization.startsWith("Bearer ")) {
            throw new UnauthorizedException("ต้องส่งโทเคนแบบ Bearer");
        }
        String token = authorization.substring("Bearer ".length()).trim();
        try { jwtTokenProvider.getUserId(token); }
        catch (JwtException e) { throw new UnauthorizedException("โทเคนไม่ถูกต้องหรือหมดอายุ"); }

        var res = cloudinaryService.uploadImage(file, folder);
        return ResponseEntity.ok(new UploadImageResponse(res.url(), res.publicId()));
    }
}

