package com.thachbao.room_rental_management.mapper;

import com.thachbao.room_rental_management.dto.request.maintenance.MaintenanceCreateRequest;
import com.thachbao.room_rental_management.dto.request.maintenance.MaintenanceUpdateRequest;
import com.thachbao.room_rental_management.dto.response.maintenance.MaintenanceRequestResponse;
import com.thachbao.room_rental_management.entity.MaintenanceRequest;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class MaintenanceRequestMapper {

    public MaintenanceRequestResponse toResponse(MaintenanceRequest entity) {
        if (entity == null) {
            return null;
        }
        return MaintenanceRequestResponse.builder()
                .id(entity.getId())
                .roomId(entity.getRoom() != null ? entity.getRoom().getId() : null)
                .roomNumber(entity.getRoom() != null ? entity.getRoom().getRoomNumber() : null)
                .rentalId(entity.getRental() != null ? entity.getRental().getId() : null)
                .tenantId(entity.getTenant() != null ? entity.getTenant().getId() : null)
                .tenantName(entity.getTenant() != null ? entity.getTenant().getFullName() : null)
                .title(entity.getTitle())
                .description(entity.getDescription())
                .priority(entity.getPriority())
                .status(entity.getStatus())
                .resolvedNote(entity.getResolvedNote())
                .repairCost(entity.getRepairCost())
                .resolvedAt(entity.getResolvedAt())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public MaintenanceRequest toEntity(MaintenanceCreateRequest request) {
        if (request == null) {
            return null;
        }
        return MaintenanceRequest.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .repairCost(BigDecimal.ZERO)
                .build();
    }

    public void updateEntity(MaintenanceRequest entity, MaintenanceUpdateRequest request) {
        if (entity == null || request == null) {
            return;
        }
        entity.setTitle(request.getTitle());
        entity.setDescription(request.getDescription());
        entity.setPriority(request.getPriority());
    }
}
