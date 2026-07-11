package com.thachbao.room_rental_management.mapper;

import com.thachbao.room_rental_management.dto.request.payment.PaymentRequest;
import com.thachbao.room_rental_management.dto.response.payment.PaymentResponse;
import com.thachbao.room_rental_management.entity.Payment;
import org.springframework.stereotype.Component;

@Component
public class PaymentMapper {

    public PaymentResponse toResponse(Payment entity) {
        if (entity == null) {
            return null;
        }
        return PaymentResponse.builder()
                .id(entity.getId())
                .invoiceId(entity.getInvoice() != null ? entity.getInvoice().getId() : null)
                .amount(entity.getAmount())
                .paymentMethod(entity.getPaymentMethod())
                .paymentDate(entity.getPaymentDate())
                .receivedByUserId(entity.getReceivedByUser() != null ? entity.getReceivedByUser().getId() : null)
                .receivedByUserName(entity.getReceivedByUser() != null ? entity.getReceivedByUser().getFullName() : null)
                .note(entity.getNote())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public Payment toEntity(PaymentRequest request) {
        if (request == null) {
            return null;
        }
        return Payment.builder()
                .amount(request.getAmount())
                .paymentMethod(request.getPaymentMethod())
                .paymentDate(request.getPaymentDate())
                .note(blankToNull(request.getNote()))
                .build();
    }

    private String blankToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
