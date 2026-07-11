package com.thachbao.room_rental_management.dto.request.invoice;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class InvoiceUpdateRequest {
    @NotNull(message = "Hạn thanh toán không được để trống")
    private LocalDate dueDate;

    @NotNull(message = "Phí khác không được để trống")
    @DecimalMin(value = "0.0", message = "Phí khác không được âm")
    private BigDecimal otherFee;

    @NotNull(message = "Số tiền giảm trừ không được để trống")
    @DecimalMin(value = "0.0", message = "Số tiền giảm trừ không được âm")
    private BigDecimal discountAmount;

    private String note;
}
