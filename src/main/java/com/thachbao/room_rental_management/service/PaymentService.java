package com.thachbao.room_rental_management.service;

import com.thachbao.room_rental_management.dto.request.payment.PaymentRequest;
import com.thachbao.room_rental_management.dto.response.payment.PaymentResponse;

import java.util.List;

public interface PaymentService {
    List<PaymentResponse> getPayments(Long invoiceId, Long receivedByUserId);
    PaymentResponse getPaymentById(Long id);
    PaymentResponse createPayment(PaymentRequest request);
}
