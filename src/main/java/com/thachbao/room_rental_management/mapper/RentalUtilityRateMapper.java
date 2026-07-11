package com.thachbao.room_rental_management.mapper;

import com.thachbao.room_rental_management.dto.request.utility.RentalUtilityRateCreateRequest;
import com.thachbao.room_rental_management.dto.request.utility.RentalUtilityRateUpdateRequest;
import com.thachbao.room_rental_management.dto.response.utility.RentalUtilityRateResponse;
import com.thachbao.room_rental_management.entity.RentalUtilityRate;
import org.springframework.stereotype.Component;

@Component
public class RentalUtilityRateMapper {

    public RentalUtilityRateResponse toResponse(RentalUtilityRate entity) {
        if (entity == null) {
            return null;
        }
        return RentalUtilityRateResponse.builder()
                .id(entity.getId())
                .rentalId(entity.getRental() != null ? entity.getRental().getId() : null)
                .roomNumber(entity.getRental() != null && entity.getRental().getRoom() != null ? entity.getRental().getRoom().getRoomNumber() : null)
                .representativeTenantName(entity.getRental() != null && entity.getRental().getRepresentativeTenant() != null ? entity.getRental().getRepresentativeTenant().getFullName() : null)
                .electricUnitPrice(entity.getElectricUnitPrice())
                .waterUnitPrice(entity.getWaterUnitPrice())
                .internetFee(entity.getInternetFee())
                .trashFee(entity.getTrashFee())
                .parkingFee(entity.getParkingFee())
                .effectiveFromMonth(entity.getEffectiveFromMonth())
                .effectiveToMonth(entity.getEffectiveToMonth())
                .note(entity.getNote())
                .createdByUserId(entity.getCreatedByUser() != null ? entity.getCreatedByUser().getId() : null)
                .createdByUserName(entity.getCreatedByUser() != null ? entity.getCreatedByUser().getFullName() : null)
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public RentalUtilityRate toEntity(RentalUtilityRateCreateRequest request) {
        if (request == null) {
            return null;
        }
        return RentalUtilityRate.builder()
                .electricUnitPrice(request.getElectricUnitPrice())
                .waterUnitPrice(request.getWaterUnitPrice())
                .internetFee(request.getInternetFee())
                .trashFee(request.getTrashFee())
                .parkingFee(request.getParkingFee())
                .effectiveFromMonth(request.getEffectiveFromMonth())
                .effectiveToMonth(blankToNull(request.getEffectiveToMonth()))
                .note(blankToNull(request.getNote()))
                .build();
    }

    public void updateEntity(RentalUtilityRate entity, RentalUtilityRateUpdateRequest request) {
        if (entity == null || request == null) {
            return;
        }
        entity.setElectricUnitPrice(request.getElectricUnitPrice());
        entity.setWaterUnitPrice(request.getWaterUnitPrice());
        entity.setInternetFee(request.getInternetFee());
        entity.setTrashFee(request.getTrashFee());
        entity.setParkingFee(request.getParkingFee());
        entity.setEffectiveToMonth(blankToNull(request.getEffectiveToMonth()));
        entity.setNote(blankToNull(request.getNote()));
    }

    private String blankToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
