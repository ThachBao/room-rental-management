package com.thachbao.room_rental_management.service;

import com.thachbao.room_rental_management.dto.request.invoice.InvoiceGenerateRequest;
import com.thachbao.room_rental_management.dto.request.invoice.InvoiceUpdateRequest;
import com.thachbao.room_rental_management.dto.response.invoice.InvoiceResponse;
import com.thachbao.room_rental_management.enums.InvoiceStatus;

import java.util.List;

public interface InvoiceService {
    List<InvoiceResponse> getInvoices(InvoiceStatus status, Long rentalId, Long roomId, String billingMonth);
    InvoiceResponse getInvoiceById(Long id);
    InvoiceResponse generateInvoice(InvoiceGenerateRequest request);
    InvoiceResponse updateInvoice(Long id, InvoiceUpdateRequest request);
    InvoiceResponse markOverdue(Long id);
    InvoiceResponse confirmPayment(Long id, String receiptImageUrl);
    InvoiceResponse approvePayment(Long id);
}
