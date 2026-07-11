package com.thachbao.room_rental_management.mapper;

import com.thachbao.room_rental_management.dto.request.room.RoomCreateRequest;
import com.thachbao.room_rental_management.dto.request.room.RoomUpdateRequest;
import com.thachbao.room_rental_management.dto.response.room.RoomResponse;
import com.thachbao.room_rental_management.entity.Room;
import com.thachbao.room_rental_management.enums.RoomStatus;
import org.springframework.stereotype.Component;

@Component
public class RoomMapper {
    public Room toEntity(RoomCreateRequest request){
        return Room.builder()
                .roomNumber(request.getRoomNumber())
                .floor(request.getFloor())
                .area(request.getArea())
                .maxPeople(request.getMaxPeople())
                .baseRentPrice(request.getBaseRentPrice())
                .defaultDepositAmount(request.getDefaultDepositAmount())
                .description(request.getDescription())
                .status(RoomStatus.AVAILABLE)
                .build();
    }

    public void updateEntity(Room room, RoomUpdateRequest request) {
        room.setRoomNumber(request.getRoomNumber());
        room.setFloor(request.getFloor());
        room.setArea(request.getArea());
        room.setMaxPeople(request.getMaxPeople());
        room.setBaseRentPrice(request.getBaseRentPrice());
        room.setDefaultDepositAmount(request.getDefaultDepositAmount());
        room.setDescription(request.getDescription());
        room.setStatus(request.getStatus());
    }

    public RoomResponse toResponse(Room room){
        return RoomResponse.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .floor(room.getFloor())
                .area(room.getArea())
                .maxPeople(room.getMaxPeople())
                .baseRentPrice(room.getBaseRentPrice())
                .defaultDepositAmount(room.getDefaultDepositAmount())
                .description(room.getDescription())
                .status(room.getStatus())
                .createdAt(room.getCreatedAt())
                .updatedAt(room.getUpdatedAt())
                .build();
    }
}
