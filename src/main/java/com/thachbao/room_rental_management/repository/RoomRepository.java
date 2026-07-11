package com.thachbao.room_rental_management.repository;

import com.thachbao.room_rental_management.entity.Room;
import com.thachbao.room_rental_management.enums.RoomStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomRepository extends JpaRepository<Room, Long> {
    boolean existsByRoomNumber(String roomNumber);
    boolean existsByRoomNumberAndIdNot(String roomNumber, Long id);
    List<Room> findByStatus(RoomStatus status);
}
