// src/main/java/com/nangnaidee/backend/dto/MeResponse.java
package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class MeResponse {
    private Integer id;
    private String email;
    private String fullName;
    private List<String> roles;
}
