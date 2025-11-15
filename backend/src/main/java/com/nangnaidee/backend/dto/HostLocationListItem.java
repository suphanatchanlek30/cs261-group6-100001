// backend/src/main/java/com/nangnaidee/backend/dto/HostLocationListItem.java

package com.nangnaidee.backend.dto;

import java.util.UUID;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HostLocationListItem {
    private UUID id;
    private String name;
    private String address;
    private String coverImageUrl;
    private String status; // "DRAFT" หรือ "APPROVED"
    private boolean isActive;
}