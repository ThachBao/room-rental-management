package com.thachbao.room_rental_management.service;

import com.thachbao.room_rental_management.dto.request.rental.RoomRentalCreateRequest;
import com.thachbao.room_rental_management.dto.request.rental.RoomRentalTerminateRequest;
import com.thachbao.room_rental_management.dto.request.rental.RoomRentalUpdateRequest;
import com.thachbao.room_rental_management.dto.response.rental.RoomRentalResponse;
import com.thachbao.room_rental_management.enums.RentalStatus;

import java.util.List;

public interface RoomRentalService {
    List<RoomRentalResponse> getAllRoomRentals(RentalStatus status);

    RoomRentalResponse getRoomRentalById(Long id);

    RoomRentalResponse createRoomRental(RoomRentalCreateRequest request);

    RoomRentalResponse updateRoomRental(Long id, RoomRentalUpdateRequest request);

    RoomRentalResponse terminateRoomRental(Long id, RoomRentalTerminateRequest request);
}
