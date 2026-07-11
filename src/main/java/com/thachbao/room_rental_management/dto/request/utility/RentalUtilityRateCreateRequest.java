package com.thachbao.room_rental_management.dto.request.utility;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class RentalUtilityRateCreateRequest {
    @NotNull(message = "Lượt thuê không được để trống")
    private Long rentalId;

    @NotNull(message = "Đơn giá điện không được để trống")
    @DecimalMin(value = "0.0", message = "Đơn giá điện không được âm")
    private BigDecimal electricUnitPrice;

    @NotNull(message = "Đơn giá nước không được để trống")
    @DecimalMin(value = "0.0", message = "Đơn giá nước không được âm")
    private BigDecimal waterUnitPrice;

    @NotNull(message = "Phí internet không được để trống")
    @DecimalMin(value = "0.0", message = "Phí internet không được âm")
    private BigDecimal internetFee;

    @NotNull(message = "Phí rác không được để trống")
    @DecimalMin(value = "0.0", message = "Phí rác không được âm")
    private BigDecimal trashFee;

    @NotNull(message = "Phí gửi xe không được để trống")
    @DecimalMin(value = "0.0", message = "Phí gửi xe không được âm")
    private BigDecimal parkingFee;

    @NotBlank(message = "Tháng áp dụng không được để trống")
    @Pattern(regexp = "^[0-9]{4}-[0-9]{2}$", message = "Tháng áp dụng phải có định dạng yyyy-MM")
    private String effectiveFromMonth;

    @Pattern(regexp = "^[0-9]{4}-[0-9]{2}$", message = "Tháng kết thúc phải có định dạng yyyy-MM")
    private String effectiveToMonth;

    @NotNull(message = "Người tạo không được để trống")
    private Long createdByUserId;

    private String note;
}
