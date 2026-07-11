package com.thachbao.room_rental_management.dto.request.maintenance;

import com.thachbao.room_rental_management.enums.MaintenancePriority;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MaintenanceCreateRequest {
    @NotNull(message = "Phòng không được để trống")
    private Long roomId;

    @NotNull(message = "Lượt thuê không được để trống")
    private Long rentalId;

    @NotNull(message = "Khách thuê báo hỏng không được để trống")
    private Long tenantId;

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotBlank(message = "Mô tả sự cố không được để trống")
    private String description;

    @NotNull(message = "Độ ưu tiên không được để trống")
    private MaintenancePriority priority;
}
