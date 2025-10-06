// src/main/java/com/nangnaidee/backend/dto/GetPaymentResponse.java

package com.nangnaidee.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class GetPaymentResponse {
    private List<GetPaymentItemDto> items;
    private int page;
    private int size;
    private long total;
}
