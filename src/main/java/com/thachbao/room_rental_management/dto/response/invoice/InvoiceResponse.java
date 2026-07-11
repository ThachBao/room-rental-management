package com.thachbao.room_rental_management.dto.response.invoice;

import com.thachbao.room_rental_management.enums.InvoiceStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InvoiceResponse {
    private Long id;
    private Long roomId;
    private String roomNumber;
    private Long rentalId;
    private Long representativeTenantId;
    private String representativeTenantName;
    private Long meterReadingId;
    private Long utilityRateId;
    private String billingMonth;
    private BigDecimal rentAmount;
    private Integer electricUsage;
    private BigDecimal electricUnitPrice;
    private BigDecimal electricAmount;
    private Integer waterUsage;
    private BigDecimal waterUnitPrice;
    private BigDecimal waterAmount;
    private BigDecimal internetFee;
    private BigDecimal trashFee;
    private BigDecimal parkingFee;
    private BigDecimal otherFee;
    private BigDecimal discountAmount;
    private BigDecimal totalAmount;
    private LocalDate dueDate;
    private LocalDateTime paidAt;
    private InvoiceStatus status;
    private String note;
    private String receiptImageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
