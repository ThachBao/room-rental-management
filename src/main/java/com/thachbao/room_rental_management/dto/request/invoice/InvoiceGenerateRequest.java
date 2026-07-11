package com.thachbao.room_rental_management.dto.request.invoice;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
public class InvoiceGenerateRequest {
    @NotNull(message = "Lượt thuê không được để trống")
    private Long rentalId;

    @NotBlank(message = "Tháng tính tiền không được để trống")
    @Pattern(regexp = "^[0-9]{4}-[0-9]{2}$", message = "Tháng tính tiền phải có định dạng yyyy-MM")
    private String billingMonth;

    @NotNull(message = "Hạn thanh toán không được để trống")
    private LocalDate dueDate;

    @DecimalMin(value = "0.0", message = "Phí khác không được âm")
    private BigDecimal otherFee;

    @DecimalMin(value = "0.0", message = "Số tiền giảm trừ không được âm")
    private BigDecimal discountAmount;

    private String note;
}
