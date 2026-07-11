package com.thachbao.room_rental_management.dto.request.room;

import com.thachbao.room_rental_management.enums.RoomStatus;
import jakarta.validation.constraints.*;
import lombok.Getter;
import lombok.Setter;
import org.aspectj.bridge.Message;

import java.math.BigDecimal;

@Getter
@Setter
public class RoomUpdateRequest {
    @NotBlank(message = "Mã phòng không được để trống")
    @Size(max = 50, message = "Mã phòng không được quá 20 ký tự")
    private String roomNumber;

    private Integer floor;

    @NotNull(message = "Diện tích không được để trống")
    @DecimalMin(value = "0.01", message = "Diện tích phải lớn hơn 0")
    private BigDecimal area;

    @NotNull(message = "Số người tối đa không được để trống")
    @Min(value = 1, message = "Số người tối đa phải lớn hơn 0")
    private Integer maxPeople;

    @NotNull(message = "Giá thuê mặc định không được để trống")
    @DecimalMin(value = "0.00", message = "Giá thuê không được âm")
    private BigDecimal baseRentPrice;

    @NotNull(message = "Tiền cọc mặc định không được để trống")
    @DecimalMin(value = "0.00", message = "Tiền cọc không được âm")
    private BigDecimal defaultDepositAmount;

    private String description;

    @NotNull(message = " Trạng thái phòng không được để trống")
    private RoomStatus status;
}