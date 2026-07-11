package com.thachbao.room_rental_management.dto.request.maintenance;

import com.thachbao.room_rental_management.enums.MaintenancePriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MaintenanceUpdateRequest {
    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotBlank(message = "Mô tả không được để trống")
    private String description;

    @NotNull(message = "Độ ưu tiên không được để trống")
    private MaintenancePriority priority;
}
