package com.thachbao.room_rental_management.dto.response.rental;

import com.thachbao.room_rental_management.enums.DepositStatus;
import com.thachbao.room_rental_management.enums.RentalStatus;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
public class RoomRentalResponse {
    private Long id;

    private Long roomId;
    private String roomNumber;

    private Long representativeTenantId;
    private String representativeTenantName;

    private LocalDate startDate;
    private LocalDate expectedEndDate;
    private LocalDate moveOutDate;

    private BigDecimal monthlyRentPrice;

    private BigDecimal depositAmount;
    private BigDecimal depositPaidAmount;
    private LocalDateTime depositPaidAt;
    private DepositStatus depositStatus;

    private BigDecimal depositDeductionAmount;
    private BigDecimal depositReturnAmount;
    private LocalDateTime depositReturnedAt;
    private String depositNote;

    private RentalStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
