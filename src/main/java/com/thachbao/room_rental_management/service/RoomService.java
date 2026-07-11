package com.thachbao.room_rental_management.service;

import com.thachbao.room_rental_management.dto.request.room.RoomCreateRequest;
import com.thachbao.room_rental_management.dto.request.room.RoomUpdateRequest;
import com.thachbao.room_rental_management.dto.response.room.RoomResponse;
import com.thachbao.room_rental_management.enums.RoomStatus;

import java.util.List;

public interface RoomService {
    List<RoomResponse> getAllRooms();

    List<RoomResponse> getRoomsByStatus(RoomStatus status);

    RoomResponse getRoomById(Long id);

    RoomResponse createRoom(RoomCreateRequest  request);

    RoomResponse   updateRoom(Long id, RoomUpdateRequest request);

    void inactiveRoom(Long id);
}
