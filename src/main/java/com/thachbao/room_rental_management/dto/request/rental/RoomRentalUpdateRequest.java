package com.thachbao.room_rental_management.dto.request.rental;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Setter
@Getter
public class RoomRentalUpdateRequest {
    @NotNull(message = "Ngày bắt đầu thuê không được để trống")
    @JsonFormat(pattern = "yyyy-MM-dd", shape = JsonFormat.Shape.STRING)
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd", shape = JsonFormat.Shape.STRING)
    private LocalDate expectedEndDate;

    @NotNull(message = "Tiền thuê tháng không được để trống")
    @DecimalMin(value = "0.0", message = "Tiền thuê tháng phải lớn hơn hoặc bằng 0")
    private BigDecimal monthlyRentPrice;

    @NotNull(message = "Tiền cọc không được để trống")
    @DecimalMin(value = "0.0", message = "Tiền cọc phải lớn hơn hoặc bằng 0")
    private BigDecimal depositAmount;

    @NotNull(message = "Tiền cọc đã trả không được để trống")
    @DecimalMin(value = "0.0", message = "Tiền cọc đã trả phải lớn hơn hoặc bằng 0")
    private BigDecimal depositPaidAmount;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private LocalDateTime depositPaidAt;

    private String depositNote;
}
