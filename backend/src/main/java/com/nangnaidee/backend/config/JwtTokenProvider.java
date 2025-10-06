// src/main/java/com/nangnaidee/backend/config/JwtTokenProvider.java

package com.nangnaidee.backend.config;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jws;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.io.Decoders;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

@Component
public class JwtTokenProvider {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration}")
    private long expirationMs;

    private SecretKey key;

    @PostConstruct
    void init() {
        // สร้าง SecretKey จากสตริง (HMAC-SHA)
        this.key = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String subject, Map<String, Object> claims) {
        Date now = new Date();
        Date exp = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .setSubject(subject)         // ใช้ userId เป็น subject
                .addClaims(claims)           // email, fullName, roles ...
                .setIssuedAt(now)
                .setExpiration(exp)
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public long getExpirationMillis() {
        return expirationMs;
    }

    public Claims parseClaims(String token) throws JwtException {
        // ถ้า secret ของคุณเป็นสตริงธรรมดา ใช้ getBytes(); ถ้าเป็น base64 ให้ใช้ Decoders.BASE64.decode(...)
        return Jwts.parserBuilder()
                .setSigningKey(this.key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public Integer getUserId(String token) throws JwtException {
        Claims claims = parseClaims(token);
        return Integer.valueOf(claims.getSubject()); // เราเก็บ userId ไว้ใน subject ตอน generate
    }
}
