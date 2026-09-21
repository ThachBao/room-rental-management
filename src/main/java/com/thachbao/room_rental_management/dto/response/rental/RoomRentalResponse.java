package com.thachbao.room_rental_management.dto.response.rental;

import com.fasterxml.jackson.annotation.JsonFormat;
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

    @JsonFormat(pattern = "yyyy-MM-dd", shape = JsonFormat.Shape.STRING)
    private LocalDate startDate;

    @JsonFormat(pattern = "yyyy-MM-dd", shape = JsonFormat.Shape.STRING)
    private LocalDate expectedEndDate;

    @JsonFormat(pattern = "yyyy-MM-dd", shape = JsonFormat.Shape.STRING)
    private LocalDate moveOutDate;

    private BigDecimal monthlyRentPrice;

    private BigDecimal depositAmount;
    private BigDecimal depositPaidAmount;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private LocalDateTime depositPaidAt;

    private DepositStatus depositStatus;

    private BigDecimal depositDeductionAmount;
    private BigDecimal depositReturnAmount;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private LocalDateTime depositReturnedAt;

    private String depositNote;

    private RentalStatus status;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss", shape = JsonFormat.Shape.STRING)
    private LocalDateTime updatedAt;
}
