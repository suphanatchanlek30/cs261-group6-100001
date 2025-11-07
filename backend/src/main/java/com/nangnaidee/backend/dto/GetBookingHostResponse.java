package com.nangnaidee.backend.dto;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GetBookingHostResponse {
    private UUID id;
    private String bookingCode;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private int hours;
    private BigDecimal total;
    private String status;

    // ถ้าต้องการส่ง info ของ LocationUnit ด้วย
    private UUID locationUnitId;
    private String locationUnitName;
    private String locationUnitCode;

    // ถ้าต้องการส่ง owner ของ Location
    private Integer ownerId;
}
