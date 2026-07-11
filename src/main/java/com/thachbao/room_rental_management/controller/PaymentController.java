package com.thachbao.room_rental_management.controller;

import com.thachbao.room_rental_management.dto.request.payment.PaymentRequest;
import com.thachbao.room_rental_management.dto.response.payment.PaymentResponse;
import com.thachbao.room_rental_management.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('LANDLORD', 'TENANT')")
    public List<PaymentResponse> getPayments(
            @RequestParam(required = false) Long invoiceId,
            @RequestParam(required = false) Long receivedByUserId
    ) {
        return paymentService.getPayments(invoiceId, receivedByUserId);
    }

    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('LANDLORD', 'TENANT')")
    public PaymentResponse getPaymentById(@PathVariable Long id) {
        return paymentService.getPaymentById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('LANDLORD')")
    public PaymentResponse createPayment(
            @Valid @RequestBody PaymentRequest request
    ) {
        return paymentService.createPayment(request);
    }
}
