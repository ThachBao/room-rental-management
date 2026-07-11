package com.thachbao.room_rental_management.mapper;

import com.thachbao.room_rental_management.dto.request.meter.MeterReadingCreateRequest;
import com.thachbao.room_rental_management.dto.request.meter.MeterReadingUpdateRequest;
import com.thachbao.room_rental_management.dto.response.meter.MeterReadingResponse;
import com.thachbao.room_rental_management.entity.MeterReading;
import org.springframework.stereotype.Component;

@Component
public class MeterReadingMapper {

    public MeterReadingResponse toResponse(MeterReading entity) {
        if (entity == null) {
            return null;
        }
        return MeterReadingResponse.builder()
                .id(entity.getId())
                .roomId(entity.getRoom() != null ? entity.getRoom().getId() : null)
                .roomNumber(entity.getRoom() != null ? entity.getRoom().getRoomNumber() : null)
                .rentalId(entity.getRental() != null ? entity.getRental().getId() : null)
                .billingMonth(entity.getBillingMonth())
                .oldElectricNumber(entity.getOldElectricNumber())
                .newElectricNumber(entity.getNewElectricNumber())
                .electricUsage(entity.getElectricUsage())
                .oldWaterNumber(entity.getOldWaterNumber())
                .newWaterNumber(entity.getNewWaterNumber())
                .waterUsage(entity.getWaterUsage())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public MeterReading toEntity(MeterReadingCreateRequest request) {
        if (request == null) {
            return null;
        }
        int electricUsage = request.getNewElectricNumber() - request.getOldElectricNumber();
        int waterUsage = request.getNewWaterNumber() - request.getOldWaterNumber();
        return MeterReading.builder()
                .billingMonth(request.getBillingMonth())
                .oldElectricNumber(request.getOldElectricNumber())
                .newElectricNumber(request.getNewElectricNumber())
                .electricUsage(electricUsage)
                .oldWaterNumber(request.getOldWaterNumber())
                .newWaterNumber(request.getNewWaterNumber())
                .waterUsage(waterUsage)
                .build();
    }

    public void updateEntity(MeterReading entity, MeterReadingUpdateRequest request) {
        if (entity == null || request == null) {
            return;
        }
        int electricUsage = request.getNewElectricNumber() - request.getOldElectricNumber();
        int waterUsage = request.getNewWaterNumber() - request.getOldWaterNumber();
        entity.setOldElectricNumber(request.getOldElectricNumber());
        entity.setNewElectricNumber(request.getNewElectricNumber());
        entity.setElectricUsage(electricUsage);
        entity.setOldWaterNumber(request.getOldWaterNumber());
        entity.setNewWaterNumber(request.getNewWaterNumber());
        entity.setWaterUsage(waterUsage);
    }
}
