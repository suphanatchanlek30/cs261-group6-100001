// backend/src/main/java/com/nangnaidee/backend/dto/HostLocationListItem.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HostLocationListItem {
    private UUID id;
    private String name;
    private String address;
    private String coverImageUrl;
    private String status; // "DRAFT" หรือ "APPROVED"
}