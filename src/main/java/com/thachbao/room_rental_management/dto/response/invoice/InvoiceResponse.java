package com.thachbao.room_rental_management.dto.response.invoice;

import com.fasterxml.jackson.annotation.JsonFormat;
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

    @JsonFormat(pattern = "yyyy-MM-dd", shape = JsonFormat.Shape.STRING)
    private LocalDate dueDate;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private LocalDateTime paidAt;

    private InvoiceStatus status;
    private String note;
    private String receiptImageUrl;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private LocalDateTime updatedAt;
}
