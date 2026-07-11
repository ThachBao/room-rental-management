package com.thachbao.room_rental_management.mapper;

import com.thachbao.room_rental_management.dto.request.invoice.InvoiceGenerateRequest;
import com.thachbao.room_rental_management.dto.request.invoice.InvoiceUpdateRequest;
import com.thachbao.room_rental_management.dto.response.invoice.InvoiceResponse;
import com.thachbao.room_rental_management.entity.Invoice;
import org.springframework.stereotype.Component;

@Component
public class InvoiceMapper {

    public InvoiceResponse toResponse(Invoice entity) {
        if (entity == null) {
            return null;
        }
        return InvoiceResponse.builder()
                .id(entity.getId())
                .roomId(entity.getRoom() != null ? entity.getRoom().getId() : null)
                .roomNumber(entity.getRoom() != null ? entity.getRoom().getRoomNumber() : null)
                .rentalId(entity.getRental() != null ? entity.getRental().getId() : null)
                .representativeTenantId(entity.getRepresentativeTenant() != null ? entity.getRepresentativeTenant().getId() : null)
                .representativeTenantName(entity.getRepresentativeTenant() != null ? entity.getRepresentativeTenant().getFullName() : null)
                .meterReadingId(entity.getMeterReading() != null ? entity.getMeterReading().getId() : null)
                .utilityRateId(entity.getUtilityRate() != null ? entity.getUtilityRate().getId() : null)
                .billingMonth(entity.getBillingMonth())
                .rentAmount(entity.getRentAmount())
                .electricUsage(entity.getElectricUsage())
                .electricUnitPrice(entity.getElectricUnitPrice())
                .electricAmount(entity.getElectricAmount())
                .waterUsage(entity.getWaterUsage())
                .waterUnitPrice(entity.getWaterUnitPrice())
                .waterAmount(entity.getWaterAmount())
                .internetFee(entity.getInternetFee())
                .trashFee(entity.getTrashFee())
                .parkingFee(entity.getParkingFee())
                .otherFee(entity.getOtherFee())
                .discountAmount(entity.getDiscountAmount())
                .totalAmount(entity.getTotalAmount())
                .dueDate(entity.getDueDate())
                .paidAt(entity.getPaidAt())
                .status(entity.getStatus())
                .note(entity.getNote())
                .receiptImageUrl(entity.getReceiptImageUrl())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public Invoice toEntity(InvoiceGenerateRequest request) {
        if (request == null) {
            return null;
        }
        return Invoice.builder()
                .billingMonth(request.getBillingMonth())
                .dueDate(request.getDueDate())
                .note(blankToNull(request.getNote()))
                .build();
    }

    public void updateEntity(Invoice entity, InvoiceUpdateRequest request) {
        if (entity == null || request == null) {
            return;
        }
        entity.setDueDate(request.getDueDate());
        entity.setOtherFee(request.getOtherFee());
        entity.setDiscountAmount(request.getDiscountAmount());
        entity.setNote(blankToNull(request.getNote()));
    }

    private String blankToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
