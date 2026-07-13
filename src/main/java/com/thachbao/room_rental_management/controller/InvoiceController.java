package com.thachbao.room_rental_management.controller;

import com.thachbao.room_rental_management.dto.request.invoice.InvoiceGenerateRequest;
import com.thachbao.room_rental_management.dto.request.invoice.InvoiceUpdateRequest;
import com.thachbao.room_rental_management.dto.response.invoice.InvoiceResponse;
import com.thachbao.room_rental_management.enums.InvoiceStatus;
import com.thachbao.room_rental_management.service.InvoiceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@RequiredArgsConstructor
public class InvoiceController {
    private final InvoiceService invoiceService;

    @GetMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('LANDLORD', 'TENANT')")
    public List<InvoiceResponse> getInvoices(
            @RequestParam(required = false) InvoiceStatus status,
            @RequestParam(required = false) Long rentalId,
            @RequestParam(required = false) Long roomId,
            @RequestParam(required = false) String billingMonth
    ) {
        return invoiceService.getInvoices(status, rentalId, roomId, billingMonth);
    }

    @GetMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('LANDLORD', 'TENANT')")
    public InvoiceResponse getInvoiceById(@PathVariable Long id) {
        return invoiceService.getInvoiceById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('LANDLORD')")
    public InvoiceResponse generateInvoice(
            @Valid @RequestBody InvoiceGenerateRequest request
    ) {
        return invoiceService.generateInvoice(request);
    }

    @PutMapping("/{id}")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('LANDLORD')")
    public InvoiceResponse updateInvoice(
            @PathVariable Long id,
            @Valid @RequestBody InvoiceUpdateRequest request
    ) {
        return invoiceService.updateInvoice(id, request);
    }

    @PutMapping("/{id}/mark-overdue")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('LANDLORD')")
    public InvoiceResponse markOverdue(@PathVariable Long id) {
        return invoiceService.markOverdue(id);
    }

    @PutMapping("/{id}/confirm-payment")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('LANDLORD', 'TENANT')")
    public InvoiceResponse confirmPayment(
            @PathVariable Long id,
            @RequestParam String receiptImageUrl
    ) {
        return invoiceService.confirmPayment(id, receiptImageUrl);
    }

    @PutMapping("/{id}/approve-payment")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('LANDLORD')")
    public InvoiceResponse approvePayment(@PathVariable Long id) {
        return invoiceService.approvePayment(id);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('LANDLORD')")
    public void deleteInvoice(@PathVariable Long id) {
        invoiceService.deleteInvoice(id);
    }
}
