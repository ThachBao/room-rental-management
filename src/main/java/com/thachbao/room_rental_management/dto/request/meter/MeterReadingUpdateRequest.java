package com.thachbao.room_rental_management.dto.request.meter;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MeterReadingUpdateRequest {
    @NotNull(message = "Chỉ số điện cũ không được để trống")
    @Min(value = 0, message = "Chỉ số điện cũ không được âm")
    private Integer oldElectricNumber;

    @NotNull(message = "Chỉ số điện mới không được để trống")
    @Min(value = 0, message = "Chỉ số điện mới không được âm")
    private Integer newElectricNumber;

    @NotNull(message = "Chỉ số nước cũ không được để trống")
    @Min(value = 0, message = "Chỉ số nước cũ không được âm")
    private Integer oldWaterNumber;

    @NotNull(message = "Chỉ số nước mới không được để trống")
    @Min(value = 0, message = "Chỉ số nước mới không được âm")
    private Integer newWaterNumber;
}
