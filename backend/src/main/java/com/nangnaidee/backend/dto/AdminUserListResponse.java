// backend/src/main/java/com/nangnaidee/backend/dto/AdminUserListResponse.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Data
@AllArgsConstructor
public class AdminUserListResponse {
    private List<AdminUserItem> items;
    private int totalElements;
    private int totalPages;
    private int currentPage;
    private int pageSize;

    @Data
    @AllArgsConstructor
    public static class AdminUserItem {
        private Integer id;
        private String email;
        private String fullName;
        private String phoneNumber;
        private Set<String> roles;
        private boolean isActive;
        private LocalDateTime createdAt;
        private LocalDateTime lastLoginAt;
    }
}