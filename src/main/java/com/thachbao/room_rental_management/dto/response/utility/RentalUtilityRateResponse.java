package com.thachbao.room_rental_management.dto.response.utility;

import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalUtilityRateResponse {
    private Long id;
    private Long rentalId;
    private String roomNumber;
    private String representativeTenantName;
    private BigDecimal electricUnitPrice;
    private BigDecimal waterUnitPrice;
    private BigDecimal internetFee;
    private BigDecimal trashFee;
    private BigDecimal parkingFee;
    private String effectiveFromMonth;
    private String effectiveToMonth;
    private String note;
    private Long createdByUserId;
    private String createdByUserName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
