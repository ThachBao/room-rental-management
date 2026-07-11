package com.thachbao.room_rental_management.dto.request.payment;

import com.thachbao.room_rental_management.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
public class PaymentRequest {
    @NotNull(message = "Hóa đơn không được để trống")
    private Long invoiceId;

    @NotNull(message = "Số tiền thanh toán không được để trống")
    @DecimalMin(value = "0.01", message = "Số tiền thanh toán phải lớn hơn 0")
    private BigDecimal amount;

    @NotNull(message = "Phương thức thanh toán không được để trống")
    private PaymentMethod paymentMethod;

    @NotNull(message = "Ngày thanh toán không được để trống")
    private LocalDateTime paymentDate;

    @NotNull(message = "Người nhận tiền không được để trống")
    private Long receivedByUserId;

    private String note;
}
