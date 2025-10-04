// src/main/java/com/nangnaidee/backend/service/CloudinaryService.java

package com.nangnaidee.backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public UploadResult uploadImage(MultipartFile file, String folder) throws IOException {
        Map res = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.asMap(
                "folder", folder,
                "resource_type", "image",
                "use_filename", true,
                "unique_filename", true,
                "overwrite", false
        ));
        String url = (String) res.get("secure_url");
        String publicId = (String) res.get("public_id");
        return new UploadResult(url, publicId);
    }

    public void deleteByPublicId(String publicId) throws IOException {
        if (publicId == null || publicId.isBlank()) return;
        cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());
    }

    public record UploadResult(String url, String publicId) {}
}