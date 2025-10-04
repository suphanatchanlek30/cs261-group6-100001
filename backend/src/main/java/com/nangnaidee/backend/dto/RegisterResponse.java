// src/main/java/com/nangnaidee/backend/dto/RegisterResponse.java
package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;


import java.util.List;


@Data
@AllArgsConstructor
public class RegisterResponse {
    private String message;
    private UserInfo user;


    @Data
    @AllArgsConstructor
    public static class UserInfo {
        private Integer id;
        private String email;
        private List<String> roles;
    }
}