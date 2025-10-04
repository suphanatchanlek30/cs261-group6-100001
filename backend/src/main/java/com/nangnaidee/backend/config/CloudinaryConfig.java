// src/main/java/com/nangnaidee/backend/config/CloudinaryConfig.java

package com.nangnaidee.backend.config;

import com.cloudinary.Cloudinary;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.Map;

@Configuration
public class CloudinaryConfig {

    @Value("${cloudinary.cloud_name:}")
    private String cloudName;
    @Value("${cloudinary.api_key:}")
    private String apiKey;
    @Value("${cloudinary.api_secret:}")
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        // ถ้าตั้ง ENV CLOUDINARY_URL มาก่อน จะใช้ ENV แทน properties
        String url = System.getenv("CLOUDINARY_URL");
        if (url != null && !url.isBlank()) {
            return new Cloudinary(url);
        }
        // fallback: ใช้ค่าจาก application-team.properties
        return new Cloudinary(Map.of(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true
        ));
    }
}
