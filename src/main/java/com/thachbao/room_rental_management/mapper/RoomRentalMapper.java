package com.thachbao.room_rental_management.mapper;

import com.thachbao.room_rental_management.dto.request.rental.RoomRentalCreateRequest;
import com.thachbao.room_rental_management.dto.request.rental.RoomRentalUpdateRequest;
import com.thachbao.room_rental_management.dto.response.rental.RoomRentalResponse;
import com.thachbao.room_rental_management.entity.RoomRental;
import com.thachbao.room_rental_management.enums.DepositStatus;
import com.thachbao.room_rental_management.enums.RentalStatus;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class RoomRentalMapper {
    public RoomRental toEntity(RoomRentalCreateRequest request) {
        return RoomRental.builder()
                .startDate(request.getStartDate())
                .expectedEndDate(request.getExpectedEndDate())
                .monthlyRentPrice(request.getMonthlyRentPrice())
                .depositAmount(request.getDepositAmount())
                .depositPaidAmount(request.getDepositPaidAmount())
                .depositPaidAt(request.getDepositPaidAt())
                .depositStatus(DepositStatus.HELD)
                .depositDeductionAmount(BigDecimal.ZERO)
                .depositReturnAmount(BigDecimal.ZERO)
                .depositNote(blankToNull(request.getDepositNote()))
                .status(RentalStatus.ACTIVE)
                .build();
    }

    public void updateEntity(RoomRental roomRental, RoomRentalUpdateRequest request) {
        roomRental.setStartDate(request.getStartDate());
        roomRental.setExpectedEndDate(request.getExpectedEndDate());
        roomRental.setMonthlyRentPrice(request.getMonthlyRentPrice());
        roomRental.setDepositAmount(request.getDepositAmount());
        roomRental.setDepositPaidAmount(request.getDepositPaidAmount());
        roomRental.setDepositPaidAt(request.getDepositPaidAt());
        roomRental.setDepositNote(blankToNull(request.getDepositNote()));
    }

    public RoomRentalResponse toResponse(RoomRental roomRental) {
        return RoomRentalResponse.builder()
                .id(roomRental.getId())

                .roomId(roomRental.getRoom() != null ? roomRental.getRoom().getId() : null)
                .roomNumber(roomRental.getRoom() != null ? roomRental.getRoom().getRoomNumber() : null)

                .representativeTenantId(
                        roomRental.getRepresentativeTenant() != null
                                ? roomRental.getRepresentativeTenant().getId()
                                : null
                )
                .representativeTenantName(
                        roomRental.getRepresentativeTenant() != null
                                ? roomRental.getRepresentativeTenant().getFullName()
                                : null
                )

                .startDate(roomRental.getStartDate())
                .expectedEndDate(roomRental.getExpectedEndDate())
                .moveOutDate(roomRental.getMoveOutDate())

                .monthlyRentPrice(roomRental.getMonthlyRentPrice())

                .depositAmount(roomRental.getDepositAmount())
                .depositPaidAmount(roomRental.getDepositPaidAmount())
                .depositPaidAt(roomRental.getDepositPaidAt())
                .depositStatus(roomRental.getDepositStatus())

                .depositDeductionAmount(roomRental.getDepositDeductionAmount())
                .depositReturnAmount(roomRental.getDepositReturnAmount())
                .depositReturnedAt(roomRental.getDepositReturnedAt())
                .depositNote(roomRental.getDepositNote())

                .status(roomRental.getStatus())

                .createdAt(roomRental.getCreatedAt())
                .updatedAt(roomRental.getUpdatedAt())
                .build();
    }

    private String blankToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
