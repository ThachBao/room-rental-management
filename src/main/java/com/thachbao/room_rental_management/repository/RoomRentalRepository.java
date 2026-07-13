package com.thachbao.room_rental_management.repository;

import com.thachbao.room_rental_management.entity.RoomRental;
import com.thachbao.room_rental_management.enums.RentalStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoomRentalRepository extends JpaRepository<RoomRental, Long> {

    List<RoomRental> findByStatus(RentalStatus status);

    List<RoomRental> findByStatusIn(List<RentalStatus> statuses);

    /** Phòng này đã có lượt thuê ACTIVE chưa? */
    boolean existsByRoom_IdAndStatus(Long roomId, RentalStatus status);

    boolean existsByRoom_IdAndStatusIn(Long roomId, List<RentalStatus> statuses);
}
