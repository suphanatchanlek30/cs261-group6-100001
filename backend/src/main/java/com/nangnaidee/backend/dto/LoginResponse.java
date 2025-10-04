// src/main/java/com/nangnaidee/backend/dto/LoginResponse.java
package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;       // JWT
    private String tokenType;         // "Bearer"
    private long   expiresIn;         // วินาที
    private List<String> roles;       // ["USER", ...]
}
