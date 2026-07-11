package com.thachbao.room_rental_management.mapper;

import com.thachbao.room_rental_management.dto.request.rental.RentalMemberCreateRequest;
import com.thachbao.room_rental_management.dto.request.rental.RentalMemberUpdateRequest;
import com.thachbao.room_rental_management.dto.response.rental.RentalMemberResponse;
import com.thachbao.room_rental_management.entity.RentalMember;
import org.springframework.stereotype.Component;

@Component
public class RentalMemberMapper {

    public RentalMemberResponse toResponse(RentalMember entity) {
        if (entity == null) {
            return null;
        }
        return RentalMemberResponse.builder()
                .id(entity.getId())
                .rentalId(entity.getRental() != null ? entity.getRental().getId() : null)
                .tenantId(entity.getTenant() != null ? entity.getTenant().getId() : null)
                .tenantName(entity.getTenant() != null ? entity.getTenant().getFullName() : null)
                .roomNumber(entity.getRental() != null && entity.getRental().getRoom() != null ? entity.getRental().getRoom().getRoomNumber() : null)
                .memberRole(entity.getMemberRole())
                .moveInDate(entity.getMoveInDate())
                .moveOutDate(entity.getMoveOutDate())
                .note(entity.getNote())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public RentalMember toEntity(RentalMemberCreateRequest request) {
        if (request == null) {
            return null;
        }
        return RentalMember.builder()
                .memberRole(request.getMemberRole())
                .moveInDate(request.getMoveInDate())
                .note(blankToNull(request.getNote()))
                .build();
    }

    public void updateEntity(RentalMember entity, RentalMemberUpdateRequest request) {
        if (entity == null || request == null) {
            return;
        }
        entity.setMemberRole(request.getMemberRole());
        entity.setMoveInDate(request.getMoveInDate());
        entity.setMoveOutDate(request.getMoveOutDate());
        entity.setNote(blankToNull(request.getNote()));
    }

    private String blankToNull(String value) {
        if (value == null || value.trim().isEmpty()) {
            return null;
        }
        return value.trim();
    }
}
