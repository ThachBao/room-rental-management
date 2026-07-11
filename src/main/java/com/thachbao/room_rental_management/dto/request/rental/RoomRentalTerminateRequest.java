package com.thachbao.room_rental_management.dto.request.rental;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
public class RoomRentalTerminateRequest {
    @NotNull(message = "Ngày trả phòng không được để trống")
    private LocalDate moveOutDate;

    @NotNull(message = "Tiền cọc bị trừ không được để trống")
    @DecimalMin(value = "0.0", message = "Tiền cọc bị trừ phải lớn hơn hoặc bằng 0")
    private BigDecimal depositDeductionAmount;

    @NotNull(message = "Tiền cọc hoàn trả không được để trống")
    @DecimalMin(value = "0.0", message = "Tiền cọc hoàn trả phải lớn hơn hoặc bằng 0")
    private BigDecimal depositReturnAmount;

    private LocalDateTime depositReturnedAt;

    private String depositNote;
}
