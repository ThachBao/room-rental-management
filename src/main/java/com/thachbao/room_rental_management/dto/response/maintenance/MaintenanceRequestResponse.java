package com.thachbao.room_rental_management.dto.response.maintenance;

import com.thachbao.room_rental_management.enums.MaintenancePriority;
import com.thachbao.room_rental_management.enums.MaintenanceStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceRequestResponse {
    private Long id;
    private Long roomId;
    private String roomNumber;
    private Long rentalId;
    private Long tenantId;
    private String tenantName;
    private String title;
    private String description;
    private MaintenancePriority priority;
    private MaintenanceStatus status;
    private String resolvedNote;
    private BigDecimal repairCost;
    private LocalDateTime resolvedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
