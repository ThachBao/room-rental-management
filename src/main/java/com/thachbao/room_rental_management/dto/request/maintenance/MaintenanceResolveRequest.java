package com.thachbao.room_rental_management.dto.request.maintenance;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class MaintenanceResolveRequest {
    @NotBlank(message = "Ghi chú xử lý sự cố không được để trống")
    private String resolvedNote;

    @NotNull(message = "Chi phí sửa chữa không được để trống")
    @DecimalMin(value = "0.0", message = "Chi phí sửa chữa không được âm")
    private BigDecimal repairCost;

    private LocalDateTime resolvedAt;
}
