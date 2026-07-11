package com.thachbao.room_rental_management.dto.response.payment;

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
    private LocalDateTime paymentDate;
    private Long receivedByUserId;
    private String receivedByUserName;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
