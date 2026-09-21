package com.thachbao.room_rental_management.dto.response.payment;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.thachbao.room_rental_management.enums.PaymentMethod;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {
    private Long id;
    private Long invoiceId;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private LocalDateTime paymentDate;

    private Long receivedByUserId;
    private String receivedByUserName;
    private String note;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private LocalDateTime updatedAt;
}
