package com.thachbao.room_rental_management.dto.request.maintenance;

import com.thachbao.room_rental_management.enums.MaintenanceStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class MaintenanceUpdateStatusRequest {
    @NotNull(message = "Trạng thái không được để trống")
    private MaintenanceStatus status;

    private String resolvedNote;

    @DecimalMin(value = "0.0", message = "Chi phí sửa chữa không được âm")
    private BigDecimal repairCost;
}
